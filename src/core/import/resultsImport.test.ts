import { describe, expect, it } from "vitest";
import { parseObjectiveScoreRows, parseReadingLevelRows } from "./resultsImport";

const students = [
  { id: "s1", name: "João Pereira" },
  { id: "s2", name: "Maria Souza" },
];

describe("parseObjectiveScoreRows", () => {
  it("casa aluno ignorando acento/maiúsculas e importa acertos", () => {
    const { entries, errors } = parseObjectiveScoreRows(
      [{ "Aluno": "joão pereira", "Acertos Português": 7, "Acertos Matemática": 5 }],
      students
    );
    expect(errors).toHaveLength(0);
    expect(entries).toEqual([
      { studentId: "s1", studentName: "João Pereira", correctPortuguese: 7, correctMath: 5 },
    ]);
  });

  it("reporta erro quando o aluno não é encontrado na turma", () => {
    const { entries, errors } = parseObjectiveScoreRows(
      [{ "Aluno": "Fulano", "Acertos Português": 1, "Acertos Matemática": 1 }],
      students
    );
    expect(entries).toHaveLength(0);
    expect(errors[0].message).toMatch(/não encontrado/);
  });

  it("reporta erro quando os acertos não são números", () => {
    const { entries, errors } = parseObjectiveScoreRows(
      [{ "Aluno": "Maria Souza", "Acertos Português": "abc", "Acertos Matemática": 4 }],
      students
    );
    expect(entries).toHaveLength(0);
    expect(errors[0].message).toMatch(/inválidos/);
  });
});

describe("parseReadingLevelRows", () => {
  it("aceita o código do nível", () => {
    const { entries, errors } = parseReadingLevelRows(
      [{ "Aluno": "João Pereira", "Nível": "leitor_fluente" }],
      students
    );
    expect(errors).toHaveLength(0);
    expect(entries[0].readingLevel).toBe("leitor_fluente");
  });

  it("aceita o rótulo completo do nível", () => {
    const { entries, errors } = parseReadingLevelRows(
      [{ "Aluno": "Maria Souza", "Nível": "Pré-Leitor 2" }],
      students
    );
    expect(errors).toHaveLength(0);
    expect(entries[0].readingLevel).toBe("pre_leitor_2");
  });

  it("reporta erro para nível desconhecido", () => {
    const { entries, errors } = parseReadingLevelRows(
      [{ "Aluno": "Maria Souza", "Nível": "nivel_invalido" }],
      students
    );
    expect(entries).toHaveLength(0);
    expect(errors[0].message).toMatch(/inválido/);
  });
});
