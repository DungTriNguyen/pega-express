import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Cấu hình OpenNext cho Cloudflare Workers (plan mục 4.1). Trang SSG được phục vụ từ asset tĩnh.
// `npm run build` = opennextjs-cloudflare build → gọi `npm run build:next` (check demo + next build) rồi đóng gói .open-next/
// Nhờ vậy Cloudflare Workers Builds để mặc định "npm run build" cũng deploy được.
const config = defineCloudflareConfig({});
config.buildCommand = "npm run build:next";

export default config;
