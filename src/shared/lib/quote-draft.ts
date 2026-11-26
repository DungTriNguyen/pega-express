/** Bản nháp báo giá dùng chung giữa máy tính báo giá và form lead (qua sessionStorage, có try/catch). */
export type QuoteDraft = {
  destination?: string;
  weightKg?: number;
  dimensions?: string;
  goodsType?: "general" | "food" | "cosmetics" | "medicine" | "liquid";
};

const KEY = "pe-quote-draft";

export function saveQuoteDraft(draft: QuoteDraft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* bỏ qua */
  }
}

export function readQuoteDraft(): QuoteDraft | undefined {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QuoteDraft) : undefined;
  } catch {
    return undefined;
  }
}
