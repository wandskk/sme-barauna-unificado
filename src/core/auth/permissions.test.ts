import { describe, expect, it } from "vitest";
import {
  assertCanManageInstitutionalContent,
  assertCanWriteIndicators,
  assertSchoolScope,
  ForbiddenError,
  type AuthContext,
} from "./permissions";

const secretaria: AuthContext = { userId: "u1", role: "SECRETARIA", schoolId: null };
const escola: AuthContext = { userId: "u2", role: "ESCOLA", schoolId: "school-1" };

describe("assertSchoolScope", () => {
  it("não lança para Secretaria/Admin, independente da escola", () => {
    expect(() => assertSchoolScope(secretaria, "qualquer-escola")).not.toThrow();
  });

  it("permite Escola acessar a própria escola", () => {
    expect(() => assertSchoolScope(escola, "school-1")).not.toThrow();
  });

  it("bloqueia Escola tentando acessar outra escola", () => {
    expect(() => assertSchoolScope(escola, "school-2")).toThrow(ForbiddenError);
  });
});

describe("assertCanWriteIndicators", () => {
  it("bloqueia o papel Escola", () => {
    expect(() => assertCanWriteIndicators(escola)).toThrow(ForbiddenError);
  });

  it("permite Secretaria", () => {
    expect(() => assertCanWriteIndicators(secretaria)).not.toThrow();
  });
});

describe("assertCanManageInstitutionalContent", () => {
  it("bloqueia o papel Escola", () => {
    expect(() => assertCanManageInstitutionalContent(escola)).toThrow(ForbiddenError);
  });
});
