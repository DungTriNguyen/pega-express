# Thêm tính năng mà không phá cái cũ

1. **Domain trước:** kiểu + schema Zod trong `src/domain/` (thêm vào `schemas.ts` hoặc file mới). Logic thuần → viết unit test trong `tests/unit/` trước (TDD).
2. **Dữ liệu:** nếu cần dữ liệu mới, thêm interface vào `src/data/repositories/index.ts`, cài đặt ở **cả** `adapters/json` và `adapters/api`, thêm case vào contract test. Thêm file `src/content/<tên>.json` dạng `{ data, meta }`.
3. **Tính năng:** tạo `src/features/<tên>/` với `components…`, `index.ts` (cổng công khai). Code server-only để ở `server/` và xuất qua `server.ts`. Mặc định Server Component; `"use client"` chỉ ở lá cần tương tác.
4. **UI dùng chung:** nếu là mảnh giao diện tái dùng (không biết nghiệp vụ) → `src/shared/ui/`. Dùng token, không mã màu cứng.
5. **i18n:** thêm chuỗi vào **cả** `vi.json` và `en.json`. Trang mới → thêm pathname dịch vào `src/i18n/routing.ts`.
6. **Route:** `src/app/[locale]/(site)/<slug>/page.tsx` — chỉ gọi repository + ghép section, có `generateMetadata` dùng `buildMetadata()` (canonical + hreflang), `setRequestLocale(locale)`. Thêm vào `src/app/sitemap.ts`.
7. **Test:** unit (domain), component (Testing Library), e2e (Playwright) cho luồng chính.
8. **Cờ bật/tắt:** tính năng chưa sẵn sàng → điều khiển bằng biến môi trường `NEXT_PUBLIC_FEATURE_<TÊN>` hoặc dữ liệu (`demo: true`), không xóa code người khác.
9. Chạy checklist trong `AGENTS.md` mục 4, mở PR.
