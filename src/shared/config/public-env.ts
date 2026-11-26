/** Biến môi trường công khai (NEXT_PUBLIC_*) — an toàn cho client. */
const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA"; // khóa thử công khai của Cloudflare

export const publicEnv = {
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY,
  cfAnalyticsToken: process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN || "",
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
} as const;
