<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Quy tắc bắt buộc cho AI agent và developer

Website Pega Express (Next.js 16 App Router + TypeScript strict + Tailwind v4). Đây là luật của repo: **đọc hết trước khi sửa code**. Máy kiểm tra phần lớn các quy tắc này (ESLint, tsc, test, CI) — nếu lệnh kiểm tra đỏ thì chưa xong.

## 1. Đọc trước khi làm

| Việc                                      | Đọc                               |
| ----------------------------------------- | --------------------------------- |
| Bất kỳ thay đổi nào                       | file này + `docs/architecture.md` |
| Thêm tính năng / trang                    | `docs/adding-a-feature.md`        |
| Giao diện, màu, chữ, hiệu ứng             | `docs/design-system.md`           |
| Giá, tuyến, FAQ, Google Sheets            | `docs/data-and-content.md`        |
| Chuỗi hiển thị, ngôn ngữ, slug            | `docs/i18n.md`                    |
| Test                                      | `docs/testing.md`                 |
| Deploy, biến môi trường                   | `docs/deployment.md`              |
| Quyết định kiến trúc đã chốt              | `docs/adr/`                       |
| API Next.js 16 (khác dữ liệu huấn luyện!) | `node_modules/next/dist/docs/`    |

Skill dùng chung cho mọi phiên AI nằm ở `.claude/skills/` (React/Next performance, kiểm tra UI, soát hiệu ứng).

## 2. Kiến trúc tầng (lint chặn chiều ngược)

```
app/ (route, mỏng) → features/ → shared/ (ui, sections, lib, config) → domain/ (kiểu, Zod, logic thuần)
app/ và features/ đọc dữ liệu qua data/ (repository) ← adapters: json | api
```

- `domain/` không import gì ngoài `domain/` (kể cả React).
- `shared/` không import `features/` hay `data/`.
- `features/<tên>/` chỉ xuất qua `index.ts` (và `server.ts` cho code server). Cấm `@/features/x/<file-bên-trong>`.
- **Chỉ `data/` được import `src/content/*.json`.** Page/component gọi `getRepositories()`.

## 3. Được làm / Cấm làm

**Được:** thêm nước = thêm dữ liệu (không sửa code) · thêm hãng tra cứu = thêm phần tử `CARRIERS` · thêm adapter dữ liệu mới theo interface trong `data/repositories`.

**Cấm:**

- Viết mã màu cứng, khoảng cách/bo góc tùy tiện trong component → dùng token (`src/styles/tokens.css`).
- Chuỗi hiển thị viết cứng trong JSX → dùng `src/i18n/messages/<lang>.json`.
- `any`, `@ts-ignore` không ghi lý do, `"use client"` ở component không tương tác.
- Đọc Google Sheets lúc khách truy cập; gọi `fetch` API ngoài tầng `data/` (trừ `features/*/server/`).
- Ảnh AI/ảnh stock trình bày như ảnh thật. Chỉ dùng ảnh trong `src/content/media.json` có `real: true`.
- Con số chưa kiểm chứng ("X năm kinh nghiệm", "số 1", "rẻ nhất"). Dữ liệu chưa xác nhận phải có `demo: true`.
- Commit bí mật. `.env*` (trừ `.env.example`) bị gitignore; bí mật đặt bằng `wrangler secret`.
- Push thẳng `main`. Dùng nhánh `feat/…`, `fix/…`, `docs/…` + PR.
- Thêm thư viện mà không ghi lý do + dung lượng trong PR.
- Animate thuộc tính khác `transform`/`opacity`; hiệu ứng làm chậm LCP; slider tự chạy; popup chặn màn hình.

## 4. Checklist trước khi commit

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

- [ ] Có đủ trạng thái: đang tải / trống / lỗi / thành công; chữ dài VI/EN không vỡ.
- [ ] Đã xem ở 375 / 768 / 1440 px, sáng + tối.
- [ ] Bàn phím dùng được, focus rõ, nhãn cho trình đọc màn hình.
- [ ] Chuỗi mới có ở cả `vi.json` và `en.json`.
- [ ] Commit theo Conventional Commits (`feat: …`, `fix: …`) — commitlint chặn sai định dạng.

## 5. Lệnh

| Lệnh                            | Việc                                                            |
| ------------------------------- | --------------------------------------------------------------- |
| `npm run dev`                   | Dev server http://localhost:3000                                |
| `npm run build`                 | Kiểm tra dữ liệu demo + build production                        |
| `npm test` / `npm run test:e2e` | Vitest (unit + contract + component) / Playwright               |
| `npm run images`                | Tối ưu ảnh `assets-src/` → `public/media` (AVIF/WebP, xóa EXIF) |
| `npm run sync:sheets`           | Google Sheets → `src/content/*.json`                            |
| `npm run check:demo`            | Báo dữ liệu demo (chặn khi `DEPLOY_ENV=production`)             |
| `npm run preview`               | Build OpenNext + chạy thử runtime Cloudflare cục bộ             |

## 6. Quyết định lớn

Đổi thư viện, đổi kiến trúc, đổi nguồn dữ liệu → viết ADR mới trong `docs/adr/` trước khi code.
