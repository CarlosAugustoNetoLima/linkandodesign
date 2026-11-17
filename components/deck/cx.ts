// Junta classes ignorando valores falsy. Sem dependência extra.
export function cx(...a: (string | false | null | undefined)[]): string {
  return a.filter(Boolean).join(" ");
}
