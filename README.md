# Pega Express — Website

Website song ngữ (Việt/Anh) của **Pega Express** — công ty gửi hàng quốc tế & hỏa tốc nội địa tại TP.HCM (CÔNG TY TNHH PEGA EXPRESS, MST 0319722024).

- **Stack:** Next.js 16 (App Router, RSC) · TypeScript strict · Tailwind CSS v4 · next-intl · next-themes · CSS scroll-driven animations · React Hook Form + Zod · Embla · Lucide
- **Hosting:** Cloudflare Workers qua `@opennextjs/cloudflare`
- **Dữ liệu:** Google Sheets (nơi sửa) → JSON (nơi web đọc) qua lớp repository; sẵn sàng đổi sang REST API (`DATA_SOURCE=api`)
- **Lead:** `/api/lead` → Google Sheets "Leads" + email `pegaexpressvn@gmail.com`, chống spam bằng Cloudflare Turnstile

> ⚠️ Bảng giá, thời gian giao, đánh giá khách hàng và chính sách hiện là **dữ liệu demo** (`demo: true`). Build production sẽ **bị chặn** cho tới khi thay bằng dữ liệu thật — xem `docs/data-and-content.md`.

## Cài đặt

Yêu cầu Node.js ≥ 20.9.

```bash
npm install
cp .env.example .env.local   # điền giá trị (máy dev có thể để trống: form dùng khóa Turnstile thử nghiệm)
npm run dev                  # http://localhost:3000  (tiếng Anh: /en)
```

## Lệnh

| Lệnh                                                    | Việc                                                 |
| ------------------------------------------------------- | ---------------------------------------------------- |
| `npm run dev`                                           | Dev server                                           |
| `npm run build` / `npm start`                           | Build production / chạy bản build                    |
| `npm run typecheck` · `npm run lint` · `npm run format` | Kiểm tra kiểu · ESLint (gồm quy tắc tầng) · Prettier |
| `npm test` · `npm run test:e2e`                         | Vitest · Playwright (375/768/1440 × sáng/tối)        |
| `npm run images`                                        | Tối ưu ảnh gốc trong `assets-src/` (không commit)    |
| `npm run sync:sheets`                                   | Đồng bộ Google Sheets → `src/content/*.json`         |
| `npm run check:demo`                                    | Liệt kê dữ liệu demo còn lại                         |
| `npm run preview` · `npm run deploy`                    | Chạy thử / deploy Cloudflare (OpenNext)              |

## Biến môi trường

Xem `.env.example` (chỉ có tên biến). Bí mật trên Cloudflare đặt bằng `npx wrangler secret put <TÊN>`. Chi tiết: `docs/deployment.md`.

## Tài liệu

`AGENTS.md` (quy tắc bắt buộc) · `CONTRIBUTING.md` · `docs/architecture.md` · `docs/adding-a-feature.md` · `docs/design-system.md` · `docs/data-and-content.md` · `docs/i18n.md` · `docs/testing.md` · `docs/deployment.md` · `docs/adr/`
