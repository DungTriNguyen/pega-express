# Kiểm thử

| Tầng         | Công cụ                                                       | Ở đâu                                                                                                                   | Lệnh                                |
| ------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Kiểu & lint  | tsc, ESLint (boundaries, jsx-a11y, core-web-vitals), Prettier | toàn bộ                                                                                                                 | `npm run typecheck && npm run lint` |
| Unit         | Vitest                                                        | `tests/unit/` — tính giá từng nước/mốc cân, khối lượng quy đổi, nhận diện mã vận đơn, lead schema, chống chèn công thức | `npm test`                          |
| Contract     | Vitest                                                        | `tests/contract/` — adapter JSON và API trả cùng kết quả                                                                | `npm test`                          |
| Component    | Testing Library                                               | `tests/unit/*.test.tsx`                                                                                                 | `npm test`                          |
| E2E          | Playwright                                                    | `tests/e2e/` × 375/768/1440 × sáng/tối                                                                                  | `npm run build && npm run test:e2e` |
| Truy cập     | axe-core (trong e2e)                                          | 0 lỗi serious/critical WCAG 2.2 AA                                                                                      |                                     |
| Hiệu năng    | Lighthouse CI                                                 | `.lighthouserc.json`                                                                                                    | CI                                  |
| Dữ liệu demo | `scripts/check-demo.ts`                                       | chặn production                                                                                                         | `npm run check:demo`                |

Playwright dùng trình duyệt đã cài sẵn; lần đầu trên máy mới: `npx playwright install chromium`.

## Ảnh chụp chuẩn (visual)

Thêm `await expect(page).toHaveScreenshot()` vào test e2e; cập nhật ảnh chuẩn bằng `npx playwright test --update-snapshots` khi thay đổi giao diện có chủ đích (đính kèm ảnh trước/sau trong PR).

## Nghiệm thu thủ công trước khi ra mắt

Chủ doanh nghiệp thử trên điện thoại thật (iPhone + Android), mở link từ Zalo và Facebook: báo giá, gửi form (nhận email + dòng mới trong Sheet), bấm Gọi / Zalo, đổi ngôn ngữ, bật tối.
