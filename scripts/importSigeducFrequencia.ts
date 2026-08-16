// Importa frequência (chamada) dos últimos N dias do SIGEduc, agregada por
// aluno/dia/disciplina — permite ver frequência geral OU por matéria, igual
// à tela de Notas. Roda com:
//   npx tsx scripts/importSigeducFrequencia.ts [dias]
// Default: 60 dias antes de hoje.

import { PrismaClient, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { listAllFrequencias } from "../src/server/integrations/sigeduc";

const prisma = new PrismaClient();

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function main() {
  const dias = Number(process.argv[2] ?? 60);
  const fim = new Date();
  const inicio = new Date(fim);
  inicio.setDate(inicio.getDate() - dias);
  const dataInicio = toDateStr(inicio);
  const dataFim = toDateStr(fim);

  console.log(`Buscando frequência de ${dataInicio} até ${dataFim}...`);
  const rows = await listAllFrequencias(dataInicio, dataFim);
  console.log(`Recebidos ${rows.length} registros de estudante (com dias aninhados).`);

  const students = await prisma.student.findMany({ select: { id: true, matricula: true, classId: true, schoolId: true } });
  const studentByMatricula = new Map(students.filter((s) => s.matricula).map((s) => [s.matricula as string, s]));

  type Agg = {
    studentId: string;
    classId: string;
    schoolId: string;
    date: string;
    disciplina: string;
    totalAulas: number;
    totalFaltas: number;
  };
  const byKey = new Map<string, Agg>();
  let unmatchedStudents = 0;
  const unmatchedSet = new Set<string>();

  for (const est of rows) {
    const student = studentByMatricula.get(est.matricula);
    if (!student) {
      unmatchedStudents++;
      unmatchedSet.add(est.matricula);
      continue;
    }
    for (const f of est.frequencias) {
      const disciplina = f.disciplina || "Não informado";
      const key = `${student.id}|${f.data}|${disciplina}`;
      const agg = byKey.get(key) ?? {
        studentId: student.id,
        classId: student.classId,
        schoolId: student.schoolId,
        date: f.data,
        disciplina,
        totalAulas: 0,
        totalFaltas: 0,
      };
      agg.totalAulas += f.quantidade_aula ?? 0;
      agg.totalFaltas += f.falta ?? 0;
      byKey.set(key, agg);
    }
  }

  const records = [...byKey.values()];
  console.log(
    `Registros dia/aluno/disciplina agregados: ${records.length}. Alunos sem matrícula casada: ${unmatchedStudents} (${unmatchedSet.size} matrículas distintas).`
  );

  const BATCH = 500;
  let written = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const values = batch.map(
      (r) =>
        Prisma.sql`(${randomUUID()}, ${r.studentId}, ${r.classId}, ${r.schoolId}, ${r.date}::date, ${r.disciplina}, ${r.totalAulas}, ${r.totalFaltas}, now(), now())`
    );
    await prisma.$executeRaw`
      INSERT INTO attendance_records (id, "studentId", "classId", "schoolId", date, disciplina, "totalAulas", "totalFaltas", "createdAt", "updatedAt")
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("studentId", "date", disciplina) DO UPDATE SET
        "totalAulas" = EXCLUDED."totalAulas",
        "totalFaltas" = EXCLUDED."totalFaltas",
        "classId" = EXCLUDED."classId",
        "schoolId" = EXCLUDED."schoolId",
        "updatedAt" = now();
    `;
    written += batch.length;
    console.log(`  ... ${written}/${records.length}`);
  }

  console.log(
    JSON.stringify({ dataInicio, dataFim, recordsWritten: written, unmatchedStudents, unmatchedMatriculas: unmatchedSet.size }, null, 2)
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
