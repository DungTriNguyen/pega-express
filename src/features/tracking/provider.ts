/**
 * Điểm tích hợp tra cứu (plan mục 7.2). GĐ1 dùng RedirectTrackingProvider:
 * nhận diện hãng → link trang tra cứu chính thức. Khi có API: viết ApiTrackingProvider
 * gọi /api/track (giấu API key, có cache) — giao diện không đổi.
 */
import { detectCarriers, normalizeTrackingCode, type CarrierId } from "@/domain/carriers";

export type TrackingResult =
  | { kind: "redirect"; code: string; options: { carrier: CarrierId; name: string; url: string }[] }
  | { kind: "unrecognized"; code: string }
  | { kind: "events"; code: string; events: { at: string; status: string; location?: string }[] };

export interface TrackingProvider {
  track(rawCode: string, locale: "vi" | "en"): Promise<TrackingResult>;
}

export const redirectTrackingProvider: TrackingProvider = {
  async track(rawCode, locale) {
    const code = normalizeTrackingCode(rawCode);
    const carriers = detectCarriers(code);
    if (!carriers.length) return { kind: "unrecognized", code };
    return {
      kind: "redirect",
      code,
      options: carriers.map((c) => ({ carrier: c.id, name: c.name, url: c.trackingUrl(code, locale) })),
    };
  },
};
