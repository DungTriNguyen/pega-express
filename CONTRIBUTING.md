# Đóng góp

## Quy trình

1. Tạo nhánh từ `main`: `feat/<mô-tả>`, `fix/<mô-tả>`, `docs/<mô-tả>`, `chore/<mô-tả>`. Không push thẳng `main` (branch protection).
2. Commit theo [Conventional Commits](https://www.conventionalcommits.org/): `feat: thêm trang hàng cấm theo nước`, `fix(quote): làm tròn khối lượng`. Husky + commitlint kiểm tra khi commit; lint-staged chạy ESLint + Prettier trên file đã sửa.
3. Mở PR, điền checklist trong template, đính kèm ảnh chụp mobile / desktop / dark mode khi đổi giao diện.
4. CI xanh (typecheck, lint, test, build, kiểm tra dữ liệu demo, quét bí mật) + 1 review mới được merge. Mỗi PR có link preview Cloudflare.

## Definition of Done

- **Chức năng:** đúng yêu cầu, có test cho logic trong `domain/` và cho form/luồng chính.
- **Trạng thái UI:** đang tải, trống, lỗi, thành công, chữ dài VI/EN.
- **Thiết bị:** 320–1920 px, xoay ngang, Safari iOS, Chrome Android, trình duyệt trong app Zalo/Facebook.
- **Truy cập:** bàn phím, focus rõ, nhãn cho trình đọc màn hình, tương phản đạt AA ở cả 2 chế độ màu, tôn trọng giảm chuyển động.
- **SEO/GEO:** meta + OG, hreflang, có trong sitemap, schema phù hợp.
- **Nội dung:** không chữ mẫu, mọi con số đã kiểm chứng (hoặc gắn `demo: true`), bản tiếng Anh đã được người duyệt.
- **Thư viện mới:** ghi lý do + dung lượng (gzip) trong PR; ưu tiên không thêm.
- **Quyết định lớn:** có ADR trong `docs/adr/`.
