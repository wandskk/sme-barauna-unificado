-- DropIndex
DROP INDEX "attendance_records_studentId_date_key";

-- AlterTable
ALTER TABLE "attendance_records" ADD COLUMN     "disciplina" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_studentId_date_disciplina_key" ON "attendance_records"("studentId", "date", "disciplina");

