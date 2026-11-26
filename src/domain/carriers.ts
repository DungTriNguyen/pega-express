/**
 * Nhận diện hãng theo định dạng mã vận đơn + tạo link tra cứu chính thức.
 * Thêm hãng mới = thêm một phần tử vào CARRIERS (nguyên tắc O trong SOLID).
 */
export type CarrierId = "dhl" | "fedex" | "ups";

export type Carrier = {
  id: CarrierId;
  name: string;
  /** Mẫu nhận diện; mã có thể khớp nhiều hãng (vd. 10 số) */
  patterns: RegExp[];
  trackingUrl: (code: string, locale: "vi" | "en") => string;
};

export const CARRIERS: readonly Carrier[] = [
  {
    id: "ups",
    name: "UPS",
    patterns: [/^1Z[0-9A-Z]{16}$/],
    trackingUrl: (code, locale) =>
      `https://www.ups.com/track?loc=${locale === "vi" ? "vi_VN" : "en_VN"}&tracknum=${encodeURIComponent(code)}`,
  },
  {
    id: "fedex",
    name: "FedEx",
    patterns: [/^\d{12}$/, /^\d{15}$/, /^\d{20}$/, /^\d{22}$/],
    trackingUrl: (code) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(code)}`,
  },
  {
    id: "dhl",
    name: "DHL Express",
    patterns: [/^\d{10}$/, /^[A-Z]{3}\d{7}$/, /^JJD\d{18}$/],
    trackingUrl: (code, locale) =>
      `https://www.dhl.com/${locale === "vi" ? "vn-vi" : "vn-en"}/home/tracking/tracking-express.html?submit=1&tracking-id=${encodeURIComponent(code)}`,
  },
];

export function normalizeTrackingCode(raw: string): string {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}

/** Trả về các hãng có thể khớp, theo thứ tự ưu tiên. Mảng rỗng = không nhận diện được. */
export function detectCarriers(raw: string): Carrier[] {
  const code = normalizeTrackingCode(raw);
  if (code.length < 8) return [];
  return CARRIERS.filter((c) => c.patterns.some((p) => p.test(code)));
}

export function getCarrier(id: CarrierId): Carrier {
  const c = CARRIERS.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown carrier ${id}`);
  return c;
}
