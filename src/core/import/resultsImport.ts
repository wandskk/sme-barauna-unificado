// Regras puras de importação de planilha — sem Prisma, sem Next.js, sem
// biblioteca de leitura de Excel (quem chama já entrega as linhas como
// array de objetos, tipicamente via XLSX.utils.sheet_to_json). Casa cada
// linha com um aluno da turma pelo nome e valida os campos esperados
// conforme o tipo de resultado do programa.

import { getReadingLevel } from "@/core/assessments/readingLevels";

export type ImportRow = Record<string, unknown>;

export type StudentRef = { id: string; name: string };

export type ObjectiveImportEntry = {
  studentId: string;
  studentName: string;
  correctPortuguese: number;
  correctMath: number;
};

export type ReadingLevelImportEntry = {
  studentId: string;
  studentName: string;
  readingLevel: string;
};

export type ImportError = { row: number; message: string };

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function findStudent(students: StudentRef[], rawName: unknown): StudentRef | null {
  const name = String(rawName ?? "").trim();
  if (!name) return null;
  const normalized = normalizeName(name);
  return students.find((s) => normalizeName(s.name) === normalized) ?? null;
}

function readNumber(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Colunas esperadas: "Aluno", "Acertos Português", "Acertos Matemática". */
export function parseObjectiveScoreRows(
  rows: ImportRow[],
  students: StudentRef[]
): { entries: ObjectiveImportEntry[]; errors: ImportError[] } {
  const entries: ObjectiveImportEntry[] = [];
  const errors: ImportError[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +1 índice, +1 cabeçalho
    const student = findStudent(students, row["Aluno"]);
    if (!student) {
      errors.push({ row: rowNumber, message: `Aluno "${row["Aluno"] ?? ""}" não encontrado na turma.` });
      return;
    }

    const correctPortuguese = readNumber(row["Acertos Português"]);
    const correctMath = readNumber(row["Acertos Matemática"]);
    if (correctPortuguese === null || correctMath === null) {
      errors.push({ row: rowNumber, message: `Valores de acertos inválidos para "${student.name}".` });
      return;
    }

    entries.push({ studentId: student.id, studentName: student.name, correctPortuguese, correctMath });
  });

  return { entries, errors };
}

/** Colunas esperadas: "Aluno", "Nível" (código ou nome do nível de leitura). */
export function parseReadingLevelRows(
  rows: ImportRow[],
  students: StudentRef[]
): { entries: ReadingLevelImportEntry[]; errors: ImportError[] } {
  const entries: ReadingLevelImportEntry[] = [];
  const errors: ImportError[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const student = findStudent(students, row["Aluno"]);
    if (!student) {
      errors.push({ row: rowNumber, message: `Aluno "${row["Aluno"] ?? ""}" não encontrado na turma.` });
      return;
    }

    const raw = String(row["Nível"] ?? "").trim();
    const byCode = getReadingLevel(raw.toLowerCase());
    const byLabel = byCode
      ? null
      : ["pre_leitor_1", "pre_leitor_2", "pre_leitor_3", "pre_leitor_4", "leitor_iniciante", "leitor_fluente"]
          .map((code) => getReadingLevel(code))
          .find((l) => l && normalizeName(l.fullLabel) === normalizeName(raw));
    const level = byCode ?? byLabel;

    if (!level) {
      errors.push({ row: rowNumber, message: `Nível de leitura "${raw}" inválido para "${student.name}".` });
      return;
    }

    entries.push({ studentId: student.id, studentName: student.name, readingLevel: level.code });
  });

  return { entries, errors };
}
