import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo123", 10);

  const school = await prisma.school.upsert({
    where: { id: "seed-escola-1" },
    update: {},
    create: {
      id: "seed-escola-1",
      name: "Escola Municipal Exemplo",
      type: "Municipal",
      zone: "urbana",
    },
  });

  await prisma.user.upsert({
    where: { email: "secretaria@barauna.rn.gov.br" },
    update: {},
    create: {
      name: "Secretaria",
      email: "secretaria@barauna.rn.gov.br",
      passwordHash,
      role: "SECRETARIA",
    },
  });

  await prisma.user.upsert({
    where: { email: "escola@barauna.rn.gov.br" },
    update: {},
    create: {
      name: "Escola Municipal Exemplo",
      email: "escola@barauna.rn.gov.br",
      passwordHash,
      role: "ESCOLA",
      schoolId: school.id,
    },
  });

  await prisma.assessmentProgram.upsert({
    where: { code: "SPADEB" },
    update: {},
    create: {
      code: "SPADEB",
      name: "SPADEB — Avaliações Municipais",
      resultType: "OBJECTIVE_SCORE",
      isDefault: true,
    },
  });

  await prisma.assessmentProgram.upsert({
    where: { code: "FLUENCIA_LEITORA" },
    update: {},
    create: {
      code: "FLUENCIA_LEITORA",
      name: "Fluência Leitora",
      resultType: "READING_LEVEL",
    },
  });

  console.log("Seed concluído. Login de demonstração: secretaria@barauna.rn.gov.br / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
