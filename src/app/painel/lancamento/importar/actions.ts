"use server";

import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import { requireAuthContext } from "@/server/auth";
import {
  getAssessment,
  recordObjectiveResult,
  recordReadingLevel,
} from "@/server/repositories/assessmentRepository";
import { prisma } from "@/server/db";
import {
  parseObjectiveScoreRows,
  parseReadingLevelRows,
  type ImportRow,
} from "@/core/import/resultsImport";

const MAX_ERRORS_SHOWN = 15;

export async function importResultsAction(formData: FormData) {
  const ctx = await requireAuthContext();

  const assessmentId = String(formData.get("assessmentId"));
  const classId = String(formData.get("classId"));
  const file = formData.get("file") as File | null;

  const redirectBase = `/painel/lancamento/importar?assessmentId=${assessmentId}&classId=${classId}`;

  if (!file || file.size === 0) {
    redirect(`${redirectBase}&importError=${encodeURIComponent("Selecione um arquivo .xlsx.")}`);
  }

  const [assessment, klass, students] = await Promise.all([
    getAssessment(assessmentId),
    prisma.class.findUniqueOrThrow({ where: { id: classId } }),
    prisma.student.findMany({ where: { classId } }),
  ]);

  const buffer = Buffer.from(await file!.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: ImportRow[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const isObjective = assessment.program.resultType === "OBJECTIVE_SCORE";
  const studentRefs = students.map((s) => ({ id: s.id, name: s.name }));

  let importedCount = 0;
  let errors: { row: number; message: string }[] = [];

  if (isObjective) {
    const { entries, errors: parseErrors } = parseObjectiveScoreRows(rows, studentRefs);
    errors = parseErrors;
    for (const entry of entries) {
      await recordObjectiveResult(ctx, {
        assessmentId,
        schoolId: klass.schoolId,
        classId,
        studentId: entry.studentId,
        correctPortuguese: entry.correctPortuguese,
        correctMath: entry.correctMath,
        totalQuestions: assessment.totalQuestions ?? 0,
      });
      importedCount++;
    }
  } else {
    const { entries, errors: parseErrors } = parseReadingLevelRows(rows, studentRefs);
    errors = parseErrors;
    for (const entry of entries) {
      await recordReadingLevel(ctx, {
        assessmentId,
        schoolId: klass.schoolId,
        classId,
        studentId: entry.studentId,
        readingLevel: entry.readingLevel,
        participated: true,
      });
      importedCount++;
    }
  }

  const errorSummary = errors
    .slice(0, MAX_ERRORS_SHOWN)
    .map((e) => `Linha ${e.row}: ${e.message}`)
    .join(" | ");

  const params = new URLSearchParams({
    assessmentId,
    classId,
    imported: String(importedCount),
    errorCount: String(errors.length),
  });
  if (errorSummary) params.set("errorSummary", errorSummary);

  redirect(`/painel/lancamento/importar?${params.toString()}`);
}
