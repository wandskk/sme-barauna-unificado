export const SHIFT_LABEL: Record<string, string> = { manha: "Manhã", tarde: "Tarde", integral: "Integral", noturno: "Noturno" };

export function shiftLabel(shift: string): string {
  return SHIFT_LABEL[shift] ?? shift;
}
