import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * CSP: trang tĩnh (SSG) không dùng nonce được nên script-src cần 'unsafe-inline'
 * cho script khởi tạo của Next/next-themes. Chỉ mở đúng các domain cần:
 * Turnstile, Cloudflare Web Analytics, và (khi bật bằng env + đồng ý cookie) GA4 / Meta Pixel.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com https://connect.facebook.net" +
    (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.facebook.com",
  "font-src 'self'",
  "connect-src 'self' https://cloudflareinsights.com https://www.google-analytics.com https://region1.google-analytics.com https://www.facebook.com",
  "frame-src https://challenges.cloudflare.com https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  // Website giới thiệu build tĩnh (SSG) bằng generateStaticParams; chưa dùng Cache Components.
  poweredByHeader: false,
  reactStrictMode: true,
  // Không dùng bộ tối ưu ảnh runtime trên Cloudflare (mục 4.7) — ảnh đã tối ưu sẵn bằng scripts/optimize-images.ts
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
