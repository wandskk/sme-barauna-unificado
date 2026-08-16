// Importa notas (boletim escolar, por disciplina/bimestre) do SIGEduc.
// Roda com: npx tsx scripts/importSigeducNotas.ts [ano]
// Default: ano corrente da School Year ativa, ou o ano atual.

import { PrismaClient, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { listAllNotas } from "../src/server/integrations/sigeduc";

const prisma = new PrismaClient();

async function main() {
  const ano = Number(process.argv[2] ?? new Date().getFullYear());

  console.log(`Buscando notas de ${ano}...`);
  const rows = await listAllNotas(ano);
  console.log(`Recebidos ${rows.length} alunos (com componentes/notas aninhados).`);

  const students = await prisma.student.findMany({ select: { id: true, matricula: true } });
  const studentByMatricula = new Map(students.filter((s) => s.matricula).map((s) => [s.matricula as string, s.id]));

  type Row = { studentId: string; classId: string; schoolId: string; disciplina: string; unidade: number; nota: number };
  const records: Row[] = [];
  let unmatchedStudents = 0;
  const unmatchedSet = new Set<string>();
  let turmaSemClasseCasada = 0;

  // turma (código SIGEduc) -> { classId, schoolId } — reaproveita o mesmo código já gravado em Class.sigeducTurmaCode
  const classes = await prisma.class.findMany({ select: { id: true, schoolId: true, sigeducTurmaCode: true } });
  const classByTurmaCode = new Map(classes.filter((c) => c.sigeducTurmaCode).map((c) => [c.sigeducTurmaCode as string, c]));

  for (const est of rows) {
    const studentId = studentByMatricula.get(est.matricula);
    if (!studentId) {
      unmatchedStudents++;
      unmatchedSet.add(est.matricula);
      continue;
    }
    for (const comp of est.turmas_componentes) {
      const klass = classByTurmaCode.get(comp.turma);
      if (!klass) {
        turmaSemClasseCasada++;
        continue;
      }
      for (const n of comp.notas) {
        records.push({
          studentId,
          classId: klass.id,
          schoolId: klass.schoolId,
          disciplina: comp.disciplina,
          unidade: n.unidade,
          nota: n.nota,
        });
      }
    }
  }

  console.log(
    `Notas a gravar: ${records.length}. Alunos sem matrícula casada: ${unmatchedStudents} (${unmatchedSet.size} distintas). Componentes com turma não casada: ${turmaSemClasseCasada}.`
  );

  const BATCH = 500;
  let written = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const values = batch.map(
      (r) =>
        Prisma.sql`(${randomUUID()}, ${r.studentId}, ${r.classId}, ${r.schoolId}, ${ano}, ${r.disciplina}, ${r.unidade}, ${r.nota}, now(), now())`
    );
    await prisma.$executeRaw`
      INSERT INTO grades (id, "studentId", "classId", "schoolId", year, disciplina, unidade, nota, "createdAt", "updatedAt")
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("studentId", disciplina, unidade, year) DO UPDATE SET
        nota = EXCLUDED.nota,
        "classId" = EXCLUDED."classId",
        "schoolId" = EXCLUDED."schoolId",
        "updatedAt" = now();
    `;
    written += batch.length;
    console.log(`  ... ${written}/${records.length}`);
  }

  console.log(JSON.stringify({ ano, recordsWritten: written, unmatchedStudents, unmatchedMatriculas: unmatchedSet.size, turmaSemClasseCasada }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
