-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "sigeducTurmaCode" TEXT;

-- AlterTable
ALTER TABLE "coordinators" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "matricula" TEXT;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "matricula" TEXT;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "matricula" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "classes_schoolId_sigeducTurmaCode_key" ON "classes"("schoolId", "sigeducTurmaCode");

-- CreateIndex
CREATE UNIQUE INDEX "coordinators_matricula_key" ON "coordinators"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "coordinators_cpf_key" ON "coordinators"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "students_matricula_key" ON "students"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "students_cpf_key" ON "students"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_matricula_key" ON "teachers"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_cpf_key" ON "teachers"("cpf");

