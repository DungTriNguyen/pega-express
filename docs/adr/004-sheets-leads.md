# ADR-004: Lead ghi vào Google Sheets + email

- Trạng thái: Đã chấp nhận
- Bối cảnh: Chưa có CRM/DB; chủ doanh nghiệp cần xem lead ngay và nhận thông báo.
- Quyết định: `POST /api/lead` → kiểm tra Zod → Turnstile → giới hạn tần suất → ghi 1 dòng vào Sheet "Leads" (service account chỉ quyền sheet đó, JWT ký bằng WebCrypto) + email về pegaexpressvn@gmail.com (Resend). Thành công nếu ≥ 1 kênh ghi được. Ô đồng ý xử lý dữ liệu cá nhân bắt buộc (Luật BVDLCN 2026, NĐ 13/2023).
- Hệ quả: Khi có backend, viết adapter lead mới ghi DB; form không đổi.
