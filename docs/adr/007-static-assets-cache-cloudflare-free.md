# ADR-007: Phục vụ trang build sẵn từ static assets (Cloudflare Workers Free)

- Trạng thái: Đã chấp nhận (27/11/2026)
- Bối cảnh: Site chạy trên Worker `pega-express` (gói Workers Free, giới hạn **10 ms CPU/request**). Workers Logs ghi ~76 lỗi 503 `exceededCpu` khi trang chủ prefetch hàng loạt RSC (`?_rsc=`, header `next-router-prefetch`) tới /chinh-sach/_, /gui-hang-di-_, /dich-vu/*… Các trang này không được cache (cache status None) nên NextServer phải render lại ở mỗi request. Chủ doanh nghiệp không muốn trả phí Workers Paid.
- Quyết định:
  - `open-next.config.ts`: `incrementalCache = static-assets-incremental-cache` và `enableCacheInterception: true`. Lúc `opennextjs-cloudflare deploy`, HTML + RSC (kể cả segment prefetch) của mọi trang SSG được chép vào static assets (`cdn-cgi/_next_cache`, chỉ Worker đọc được). Request trúng cache được trả thẳng, **không khởi động NextServer/React**.
  - `src/app/[locale]/layout.tsx`: `dynamic = "force-static"`, `revalidate = false`, `dynamicParams = false` — mọi trang nội dung (cả trang 404 bắt-tất-cả) là tĩnh. Chỉ `POST /api/lead` còn động.
  - Không sửa hành vi prefetch của `<Link>`.
- Kiểm chứng (chạy `opennextjs-cloudflare preview` cục bộ): HTML và RSC prefetch của 10 trang mẫu (vi/en, tuyến, dịch vụ, chính sách, công cụ, 404) đều trả `x-opennext-cache: HIT`; segment prefetch (`next-router-segment-prefetch`) cũng HIT; điều hướng client + đổi ngôn ngữ không lỗi console; `/api/lead` vẫn chạy.
- Hệ quả:
  - Cache chỉ đọc, **không ISR/revalidate**: muốn đổi nội dung phải build + deploy lại (đúng luồng Sheets → JSON → build đã chốt ở ADR-002).
  - Nếu sau này cần trang render theo request (CRM, ISR) thì phải chuyển sang R2/KV incremental cache và cân nhắc gói Paid.
  - Proxy (middleware i18n) vẫn chạy trên mọi request nhưng chỉ rewrite/redirect, rất nhẹ.
