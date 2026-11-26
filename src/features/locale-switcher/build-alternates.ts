/** Hàm thuần dùng ở server (layout) để dựng bảng slug tương ứng giữa các ngôn ngữ. */
export function buildAlternates(records: { slug: { vi: string; en: string } }[]) {
  const vi: Record<string, string> = {};
  const en: Record<string, string> = {};
  for (const r of records) {
    vi[r.slug.vi] = r.slug.en;
    en[r.slug.en] = r.slug.vi;
  }
  return { vi, en };
}
