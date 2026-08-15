// Result type simples para funções de domínio que podem falhar de forma
// esperada (validação, regra de negócio) sem recorrer a exceptions para
// controle de fluxo. Erros inesperados continuam sendo exceptions normais.
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
