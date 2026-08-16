import { describe, expect, it } from "vitest";
import { calculatePercentage, classify, scoreObjectiveResult } from "./scoring";

describe("classify", () => {
  it("classifica como Abaixo do Básico até 40%", () => {
    expect(classify(0)).toBe("Abaixo do Básico");
    expect(classify(40)).toBe("Abaixo do Básico");
  });

  it("classifica como Básico entre 40% (exclusive) e 60%", () => {
    expect(classify(41)).toBe("Básico");
    expect(classify(60)).toBe("Básico");
  });

  it("classifica como Proficiente entre 60% (exclusive) e 80%", () => {
    expect(classify(61)).toBe("Proficiente");
    expect(classify(80)).toBe("Proficiente");
  });

  it("classifica como Avançado acima de 80%", () => {
    expect(classify(81)).toBe("Avançado");
    expect(classify(100)).toBe("Avançado");
  });
});

describe("calculatePercentage", () => {
  it("calcula o percentual arredondado para 2 casas", () => {
    expect(calculatePercentage(1, 3)).toBe(33.33);
  });

  it("retorna 0 quando não há questões (evita divisão por zero)", () => {
    expect(calculatePercentage(5, 0)).toBe(0);
  });
});

describe("scoreObjectiveResult", () => {
  it("soma os acertos e classifica corretamente", () => {
    const result = scoreObjectiveResult({ correctPortuguese: 6, correctMath: 4, totalQuestions: 10 });
    expect(result.totalCorrect).toBe(10);
    expect(result.percentage).toBe(100);
    expect(result.classification).toBe("Avançado");
  });
});
