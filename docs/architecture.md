# Kiến trúc

## Tầng & chiều phụ thuộc

```
src/app/        Route (mỏng): lấy dữ liệu qua repository, ghép section. Không logic nghiệp vụ.
  └─ [locale]/(site)/…        Trang công khai (vi ở "/", en ở "/en")
  └─ api/lead/route.ts        Nhận form lead
  └─ (crm)/crm/…              (GĐ4) CRM nội bộ — noindex, middleware/proxy auth
src/features/   Tính năng tự đóng gói, chỉ xuất qua index.ts (+ server.ts)
src/shared/     ui/ (design system) · sections/ (chỉ hiển thị) · lib/ · config/
src/domain/     Kiểu + schema Zod + logic thuần (pricing, volumetric, carriers) — không phụ thuộc gì
src/data/       repositories/ (interface) · adapters/json · adapters/api · index.ts (factory)
src/content/    JSON sinh từ Google Sheets (không sửa tay khi đã bật sync) + media.json
src/i18n/       routing (pathnames dịch), request, messages/vi.json, en.json
```

ESLint (`eslint-plugin-boundaries` + `no-restricted-imports`) chặn mọi import đi ngược chiều, import "ruột" feature khác, và import `content/*.json` ngoài tầng `data/`.

## Luồng dữ liệu

```
Google Sheets ──(scripts/sync-sheets.ts, Zod)──► src/content/*.json ──► JsonRepositories ─┐
                                                                                           ├─► getRepositories() ─► page.tsx ─► section/feature
REST API backend (tương lai) ─────────────────────────────────────► ApiRepositories ──────┘
```

- File JSON có cùng định dạng API: `{ data: [...], meta: { updatedAt, version } }`, ID ổn định, trường song ngữ `{ vi, en }`. Team backend dùng chính các schema trong `src/domain/schemas.ts` làm đặc tả.
- Mọi trang được build tĩnh (SSG) bằng `generateStaticParams`; `dynamicParams = false` cho route động.

## Đổi JSON → REST API

1. Backend cung cấp các endpoint `GET /v1/destinations | pricing | services | faq | testimonials | prohibited | policies`, trả đúng schema.
2. Đặt `DATA_SOURCE=api` và `API_BASE_URL`.
3. Chạy `npm test` — contract test (`tests/contract/repositories.test.ts`) bảo đảm hai adapter trả cùng kết quả.
4. Không sửa một dòng giao diện nào.

## Tra cứu vận đơn

`features/tracking/provider.ts` định nghĩa `TrackingProvider`. Hiện dùng `redirectTrackingProvider` (nhận diện mã → link DHL/FedEx/UPS). Khi có API: viết provider gọi `/api/track` (Route Handler giấu API key, có cache) và truyền vào `TrackingForm`.

## Lead

`LeadForm` (RHF + Zod + Turnstile) → `POST /api/lead` → `features/lead/server/handler.ts`: Zod → honeypot → giới hạn tần suất → Turnstile → song song ghi Google Sheets (JWT RS256 bằng WebCrypto, chạy được trên Workers) + email Resend. Thành công nếu ≥ 1 kênh ghi được; cả hai lỗi → giao diện hiện nút Gọi/Zalo. Giá trị bắt đầu bằng `= + - @` được thêm tiền tố `'`. Không log dữ liệu cá nhân.

## CRM (GĐ4)

Nhóm route `src/app/(crm)/crm`, tiếng Việt, `noindex`, `proxy.ts` kiểm tra phiên (cookie httpOnly cùng domain do backend cấp). Dùng lại `shared/ui`; thêm TanStack Query/Table khi cần.
