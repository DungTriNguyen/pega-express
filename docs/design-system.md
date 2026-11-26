# Design system — "Charcoal biên tập + nhãn vận đơn hàng không"

## Nguyên tắc

1. Xen kẽ mảng **charcoal** và **trắng ngà ấm** (không trắng tinh). Cam chỉ cho CTA, đường bay, điểm nhấn.
2. **Một dòng tiêu đề siêu lớn** (Saira Condensed, chữ hoa) mở đầu hero và mỗi section chính.
3. Chi tiết **nhãn vận đơn**: mã tuyến `SGN · LAX`, số vận đơn monospace, mã vạch làm đường kẻ (`.barcode-rule`), tem (`<Stamp>`), góc vuông (`<WaybillLabel>`).
4. **Tuyến dạng bảng giờ bay** (`DeparturesBoard`), rê chuột thì đường bay sáng.
5. **Họa tiết cánh** (`WingDivider`, CTA cuối) và **vòng cung logo** thành đường bay (`RouteMap`).
6. Chỉ ảnh kho thật (`media.json` `real: true`), chỉnh tông charcoal; không ảnh stock, mockup 3D.
7. Chỉ số liệu thật.

## Token (src/styles/tokens.css)

- **Tầng 1 primitive:** `--orange-50…900` (gốc `#EB6224`), `--charcoal-50…950` (gốc `#1E2F38`), `--ivory-50…200`.
- **Tầng 2 ngữ nghĩa** (đổi theo `[data-theme]`): `--c-bg, --c-surface, --c-surface-2, --c-text, --c-text-muted, --c-brand, --c-brand-strong, --c-border, --c-focus…` → utility Tailwind `bg-bg, bg-surface, text-fg, text-muted, text-brand-strong, border-border, outline-focus…`
- **Tầng 3 component:** `--button-primary-bg/fg`, `--route-line`, `--label-paper/ink`, `--image-filter`.
- Mảng luôn tối (hero, process, CTA cuối, footer) dùng thang tĩnh `bg-charcoal-900/950`, `text-ivory-50`.

**Tương phản:** chữ trắng trên `#EB6224` chỉ ~3,3:1 → nút/chữ nhỏ dùng `brand-strong` (orange-700 `#AD4511`, ≥5:1 trên trắng và nền ngà — `#C24E15` của plan chỉ đạt 4,1–4,5:1 trên nền ngà nên đã chỉnh đậm hơn). Cam gốc chỉ cho mảng lớn/chữ ≥ 24px đậm.

## Chữ

| Vai trò          | Font                       | Class                                |
| ---------------- | -------------------------- | ------------------------------------ |
| Tiêu đề lớn      | Saira Condensed 700/800    | `font-display text-display-xl/lg/md` |
| Tiêu đề phụ, nút | Saira 600                  | `font-sub`                           |
| Nội dung         | Be Vietnam Pro 400/500/600 | mặc định                             |
| Mã, số liệu      | JetBrains Mono 500/600     | `font-mono`                          |

Tự host qua `next/font` (subset latin + vietnamese), không gọi Google lúc chạy.

## Khoảng cách, bo góc, bóng

Thang 4px của Tailwind; bo `rounded-sm 4 / md 8 / lg 16` (nhãn vận đơn: góc vuông); bóng `shadow-1`, `shadow-2`.

## Dark mode

`next-themes`, `data-theme` trên `<html>`, mặc định theo máy, lưu lựa chọn, không nháy. Ảnh giảm sáng nhẹ (`--image-filter`). Logo: bản màu trên nền sáng, bản âm trắng trên nền tối (`<Logo variant="auto">`).

## Hiệu ứng (mức "Cân bằng")

| Hiệu ứng                              | Cài đặt                                                            |
| ------------------------------------- | ------------------------------------------------------------------ |
| Đường bay tự vẽ (hero)                | SVG + CSS `@keyframes draw-route` (không JS), chạy sau tiêu đề     |
| Số đếm tăng                           | `CountUp` (IntersectionObserver + rAF), HTML ban đầu đã có số cuối |
| Quy trình 4 bước, đường nối theo cuộn | `ProcessSteps` (CSS scroll-driven `.process-line`)                 |
| Gallery kho kéo ngang                 | Embla `CapabilityGallery`                                          |
| Testimonial kéo ngang                 | Embla, không tự chạy                                               |
| Parallax nhẹ ảnh hero                 | `ParallaxImage` (CSS scroll-driven `.parallax-layer`)              |
| Chuyển trang                          | React `<ViewTransition>` + CSS                                     |
| Hiện dần khi cuộn                     | class `.reveal` (CSS scroll-driven, không JS)                      |

Quy tắc: chỉ `transform`/`opacity`; 150–600ms; tôn trọng `prefers-reduced-motion`; nội dung không bị ẩn nếu JS lỗi; không cursor tùy biến, không popup, không slider tự chạy. Không dùng thư viện Motion để giữ JS nhỏ (ADR-006); chỉ thêm lại khi thật cần, trong đúng route cần.

## Tránh để không giống "web AI"

Không hero tàu/container/xe tải stock · không hàng 4 con số "850+" · không lưới 4 icon dịch vụ đồng phục · không gradient tím/kính mờ · không mockup laptop 3D · không chữ mẫu.

## Logo

Hiện là PNG/WebP nền trong suốt tách từ file PNG trong Drive (`npm run images`). **Cần file SVG xuất từ `LOGO PEGA - DONE.ai`** để thay vào `src/shared/ui/logo.tsx`.
