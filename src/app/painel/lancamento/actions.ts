"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/server/auth";
import {
  getAssessment,
  recordObjectiveResult,
  recordReadingLevel,
} from "@/server/repositories/assessmentRepository";
import { prisma } from "@/server/db";

export async function saveLancamentoAction(formData: FormData) {
  const ctx = await requireAuthContext();

  const assessmentId = String(formData.get("assessmentId"));
  const classId = String(formData.get("classId"));
  const assessment = await getAssessment(assessmentId);
  const klass = await prisma.class.findUniqueOrThrow({ where: { id: classId } });
  const students = await prisma.student.findMany({ where: { classId } });

  for (const student of students) {
    const participated = formData.get(`participated_${student.id}`) === "on";
    if (!participated) continue;

    if (assessment.program.resultType === "OBJECTIVE_SCORE") {
      const correctPortuguese = Number(formData.get(`correctPortuguese_${student.id}`) ?? 0);
      const correctMath = Number(formData.get(`correctMath_${student.id}`) ?? 0);
      await recordObjectiveResult(ctx, {
        assessmentId,
        schoolId: klass.schoolId,
        classId,
        studentId: student.id,
        correctPortuguese,
        correctMath,
        totalQuestions: assessment.totalQuestions ?? 0,
      });
    } else {
      const readingLevel = String(formData.get(`readingLevel_${student.id}`) ?? "");
      if (!readingLevel) continue;
      await recordReadingLevel(ctx, {
        assessmentId,
        schoolId: klass.schoolId,
        classId,
        studentId: student.id,
        readingLevel,
        participated: true,
      });
    }
  }

  revalidatePath("/painel/lancamento");
}
