// Importa a base de escolas/professores/turmas/alunos da rede municipal a
// partir do SIGEduc/Educ21, para reconstruir o cadastro depois do reset do
// banco (ver docs/ARCHITECTURE.md e a conversa que motivou isso).
//
// Rodar com: npx tsx scripts/importSigeduc.ts
//
// Limitações conhecidas, de propósito (não são bugs, são o que a fonte de
// dados permite nesta primeira importação):
//  - Só cobre as escolas que existem no SIGEduc (rede municipal). Escolas
//    estaduais/particulares continuam de cadastro manual em /admin/escolas.
//  - `Class.teacherId` guarda só 1 professor por turma: nos anos iniciais
//    (professor polivalente) isso é fiel à realidade; nos anos finais, onde
//    cada disciplina tem um professor, ficamos com o professor de
//    "Atividade Polivalente" se existir, senão o primeiro professor
//    encontrado para aquela turma — os demais ficam de fora por limitação
//    do schema atual (1 turma : 1 professor), não da importação.
//  - `School.zone` (rural/urbana) não vem do SIGEduc (o endpoint de escola
//    só dá nome + código INEP) — fica no padrão "urbana" até alguém
//    corrigir manualmente.
//  - Alunos cujo código de turma não apareceu em nenhum registro de
//    servidor (então não sabemos série/turno) são pulados e reportados no
//    final, em vez de criar uma turma "adivinhada".

import { PrismaClient } from "@prisma/client";
import {
  listEscolas,
  listAllServidores,
  listAllEstudantesEnturmados,
  PROFESSOR_CARGOS,
  COORDENADOR_CARGOS,
  mapTurno,
  turmaLetterFromCode,
  normalizeName,
} from "../src/server/integrations/sigeduc";

const prisma = new PrismaClient();
const ANO = 2026;

async function main() {
  const report: Record<string, unknown> = {};

  // 1. Escolas — a base inteira vem do SIGEduc (o cadastro anterior foi perdido)
  const escolas = await listEscolas();
  const schoolIdByInep = new Map<string, string>();
  for (const e of escolas) {
    const school = await prisma.school.upsert({
      where: { inepCode: e.codigo_inep },
      update: { name: e.nome, sigeducSchoolId: e.id },
      create: { name: e.nome, inepCode: e.codigo_inep, sigeducSchoolId: e.id, type: "municipal" },
    });
    schoolIdByInep.set(e.codigo_inep, school.id);
  }
  report.schoolsImported = escolas.length;

  const schoolYear = await prisma.schoolYear.upsert({
    where: { year: ANO },
    update: { active: true },
    create: { year: ANO, active: true },
  });

  // 2. Servidores — dá a lista de turmas (série/turno/código) + professores + coordenadores
  const servidores = await listAllServidores();
  report.servidoresFetched = servidores.length;

  type ClassAgg = {
    schoolId: string;
    grade: string;
    shift: string;
    sigeducTurmaCode: string;
    teacherMatricula: string | null;
    teacherIsPolivalente: boolean;
    coordinatorMatricula: string | null;
  };
  const classByKey = new Map<string, ClassAgg>();
  const teacherRows = new Map<string, { nome: string; cpf: string }>();
  const coordinatorRows = new Map<string, { nome: string; cpf: string }>();
  let servidoresSemEscola = 0;

  for (const s of servidores) {
    if (!s.turma || !s.codigo_inep_escola) continue;
    const schoolId = schoolIdByInep.get(s.codigo_inep_escola);
    if (!schoolId) {
      servidoresSemEscola++;
      continue;
    }
    const key = `${schoolId}|${s.turma}`;
    let agg = classByKey.get(key);
    if (!agg) {
      agg = {
        schoolId,
        grade: s.serie ?? "",
        shift: mapTurno(s.turno),
        sigeducTurmaCode: s.turma,
        teacherMatricula: null,
        teacherIsPolivalente: false,
        coordinatorMatricula: null,
      };
      classByKey.set(key, agg);
    }

    const isProfessor = PROFESSOR_CARGOS.has(s.cargo) && s.funo === "SALA DE AULA";
    if (isProfessor && s.matricula) {
      teacherRows.set(s.matricula, { nome: s.nome, cpf: s.cpf });
      const isPolivalente = s.disciplina === "Atividade Polivalente";
      if (!agg.teacherMatricula || (isPolivalente && !agg.teacherIsPolivalente)) {
        agg.teacherMatricula = s.matricula;
        agg.teacherIsPolivalente = isPolivalente;
      }
    }

    if (COORDENADOR_CARGOS.has(s.cargo) && s.matricula) {
      coordinatorRows.set(s.matricula, { nome: s.nome, cpf: s.cpf });
      if (!agg.coordinatorMatricula) agg.coordinatorMatricula = s.matricula;
    }
  }
  report.servidoresSemEscolaCasada = servidoresSemEscola;
  report.professoresDistintos = teacherRows.size;
  report.coordenadoresDistintos = coordinatorRows.size;
  report.turmasDoServidor = classByKey.size;

  const teacherIdByMatricula = new Map<string, string>();
  for (const [matricula, t] of teacherRows) {
    const row = await prisma.teacher.upsert({
      where: { matricula },
      update: { name: t.nome, cpf: t.cpf || null },
      create: { name: t.nome, matricula, cpf: t.cpf || null },
    });
    teacherIdByMatricula.set(matricula, row.id);
  }

  const coordinatorIdByMatricula = new Map<string, string>();
  for (const [matricula, c] of coordinatorRows) {
    const row = await prisma.coordinator.upsert({
      where: { matricula },
      update: { name: c.nome, cpf: c.cpf || null },
      create: { name: c.nome, matricula, cpf: c.cpf || null },
    });
    coordinatorIdByMatricula.set(matricula, row.id);
  }

  // O nome curto ("A", "B"...) é só cosmético — a identidade real da turma é
  // sigeducTurmaCode. Evita colidir com a unique constraint antiga
  // (schoolId+grade+shift+name+schoolYearId) quando duas turmas caem no
  // mesmo grupo mas com códigos diferentes (ex.: regular x EJA na mesma série/turno).
  const usedNames = new Map<string, Set<string>>();
  function resolveClassName(agg: ClassAgg): string {
    const groupKey = `${agg.schoolId}|${agg.grade}|${agg.shift}`;
    const used = usedNames.get(groupKey) ?? new Set<string>();
    usedNames.set(groupKey, used);
    let candidate = turmaLetterFromCode(agg.sigeducTurmaCode);
    if (used.has(candidate)) candidate = agg.sigeducTurmaCode;
    used.add(candidate);
    return candidate;
  }

  const classIdByKey = new Map<string, string>();
  for (const [key, agg] of classByKey) {
    const name = resolveClassName(agg);
    const row = await prisma.class.upsert({
      where: { sigeduc_turma_identity: { schoolId: agg.schoolId, sigeducTurmaCode: agg.sigeducTurmaCode } },
      update: {
        grade: agg.grade,
        shift: agg.shift,
        schoolYearId: schoolYear.id,
        teacherId: agg.teacherMatricula ? teacherIdByMatricula.get(agg.teacherMatricula) : undefined,
        coordinatorId: agg.coordinatorMatricula ? coordinatorIdByMatricula.get(agg.coordinatorMatricula) : undefined,
      },
      create: {
        schoolId: agg.schoolId,
        grade: agg.grade,
        shift: agg.shift,
        name,
        sigeducTurmaCode: agg.sigeducTurmaCode,
        schoolYearId: schoolYear.id,
        teacherId: agg.teacherMatricula ? teacherIdByMatricula.get(agg.teacherMatricula) : undefined,
        coordinatorId: agg.coordinatorMatricula ? coordinatorIdByMatricula.get(agg.coordinatorMatricula) : undefined,
      },
    });
    classIdByKey.set(key, row.id);
  }
  report.classesImported = classIdByKey.size;

  // 3. Alunos enturmados
  const estudantes = await listAllEstudantesEnturmados(ANO);
  report.estudantesFetched = estudantes.length;

  const schoolIdByNormalizedName = new Map<string, string>();
  for (const e of escolas) schoolIdByNormalizedName.set(normalizeName(e.nome), schoolIdByInep.get(e.codigo_inep)!);

  let studentsImported = 0;
  let studentsSkippedNoSchool = 0;
  let studentsSkippedNoClass = 0;
  const skippedTurmas = new Set<string>();

  for (const est of estudantes) {
    const schoolId = schoolIdByNormalizedName.get(normalizeName(est.nomeEscola));
    if (!schoolId) {
      studentsSkippedNoSchool++;
      continue;
    }
    const classKey = `${schoolId}|${est.nome_turma_serie}`;
    const classId = classIdByKey.get(classKey);
    if (!classId) {
      studentsSkippedNoClass++;
      skippedTurmas.add(classKey);
      continue;
    }
    if (!est.matricula) continue;
    await prisma.student.upsert({
      where: { matricula: est.matricula },
      update: { name: est.nome, schoolId, classId, cpf: est.cpf || null },
      create: { name: est.nome, schoolId, classId, matricula: est.matricula, cpf: est.cpf || null },
    });
    studentsImported++;
  }
  report.studentsImported = studentsImported;
  report.studentsSkippedNoSchool = studentsSkippedNoSchool;
  report.studentsSkippedNoClass = studentsSkippedNoClass;
  report.turmasSemProfessorComAlunos = skippedTurmas.size;

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
