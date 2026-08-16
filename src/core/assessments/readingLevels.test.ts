import { describe, expect, it } from "vitest";
import { getReadingLevel, READING_LEVELS } from "./readingLevels";

describe("getReadingLevel", () => {
  it("encontra um nível pelo código", () => {
    expect(getReadingLevel("leitor_fluente")?.fullLabel).toBe("Leitor Fluente");
  });

  it("retorna null para um código desconhecido", () => {
    expect(getReadingLevel("nao_existe")).toBeNull();
  });

  it("tem 6 níveis em ordem crescente", () => {
    expect(READING_LEVELS).toHaveLength(6);
    const orders = READING_LEVELS.map((l) => l.order);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
