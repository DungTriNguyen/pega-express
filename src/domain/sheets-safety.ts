/** Chống chèn công thức (CSV/formula injection) khi ghi vào Google Sheets. */
export function sanitizeCell(value: unknown): string {
  const s = value === undefined || value === null ? "" : String(value);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}
