-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "inepCode" TEXT,
ADD COLUMN     "sigeducSchoolId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "schools_inepCode_key" ON "schools"("inepCode");

-- CreateIndex
CREATE UNIQUE INDEX "schools_sigeducSchoolId_key" ON "schools"("sigeducSchoolId");

