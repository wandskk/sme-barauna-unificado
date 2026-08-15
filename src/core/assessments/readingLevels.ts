// Níveis de fluência leitora — portado de src/lib/fluencyLevels.ts do
// projeto legado. Único lugar a editar se a escala mudar (regra herdada
// do README original do módulo).
export type ReadingLevelCode =
  | "pre_leitor_1"
  | "pre_leitor_2"
  | "pre_leitor_3"
  | "pre_leitor_4"
  | "leitor_iniciante"
  | "leitor_fluente";

export const READING_LEVELS: {
  code: ReadingLevelCode;
  order: number;
  shortLabel: string;
  fullLabel: string;
  color: string;
}[] = [
  { code: "pre_leitor_1", order: 1, shortLabel: "PL1", fullLabel: "Pré-Leitor 1", color: "#dc2626" },
  { code: "pre_leitor_2", order: 2, shortLabel: "PL2", fullLabel: "Pré-Leitor 2", color: "#ea580c" },
  { code: "pre_leitor_3", order: 3, shortLabel: "PL3", fullLabel: "Pré-Leitor 3", color: "#d97706" },
  { code: "pre_leitor_4", order: 4, shortLabel: "PL4", fullLabel: "Pré-Leitor 4", color: "#ca8a04" },
  { code: "leitor_iniciante", order: 5, shortLabel: "LI", fullLabel: "Leitor Iniciante", color: "#2563eb" },
  { code: "leitor_fluente", order: 6, shortLabel: "LF", fullLabel: "Leitor Fluente", color: "#16a34a" },
];

export function getReadingLevel(code: string) {
  return READING_LEVELS.find((l) => l.code === code) ?? null;
}
