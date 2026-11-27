import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * OpenNext cho Cloudflare Workers — gói Free (giới hạn 10 ms CPU/request). Xem ADR-007.
 *
 * - incrementalCache = static assets: HTML + RSC của mọi trang SSG được ghi vào static assets lúc build
 *   (thư mục `cdn-cgi/_next_cache`, chỉ Worker đọc được). Chỉ đọc, không revalidate — đúng với website
 *   build lại mỗi khi dữ liệu đổi (Sheets → JSON → build).
 * - enableCacheInterception: request (kể cả prefetch `?_rsc=` / segment prefetch) trúng cache được trả
 *   thẳng, KHÔNG khởi động NextServer → CPU mỗi request rất thấp.
 * - Chỉ route thực sự động (POST /api/lead, 404 của đường dẫn lạ) mới chạy React trên Worker.
 *
 * `npm run build` = opennextjs-cloudflare build → gọi `npm run build:next` (check demo + next build) rồi đóng gói .open-next/
 */
const config = defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
config.buildCommand = "npm run build:next";

export default config;
