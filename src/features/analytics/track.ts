/** Sự kiện chuyển đổi (plan mục 7.4). Gửi tới GA4/Meta Pixel chỉ khi đã được bật + đồng ý. */
export type TrackEvent =
  "quote_submit" | "quote_calculate" | "zalo_click" | "call_click" | "track_search" | "messenger_click";

type W = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
};

export function track(event: TrackEvent, params: Record<string, string | number | undefined> = {}) {
  if (typeof window === "undefined") return;
  const w = window as W;
  w.gtag?.("event", event, params);
  if (event === "quote_submit") w.fbq?.("track", "Lead", params);
  else w.fbq?.("trackCustom", event, params);
  if (process.env.NODE_ENV === "development") console.debug("[track]", event, params);
}
