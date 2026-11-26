# ADR-005: Dữ liệu demo được gắn cờ và chặn ở production

- Trạng thái: Đã chấp nhận
- Bối cảnh: Chưa có bảng giá, thời gian giao, đánh giá, chính sách chính thức nhưng cần web hoàn chỉnh để duyệt.
- Quyết định: Mọi bản ghi chưa xác nhận có `demo: true`; web hiển thị nhãn "Giá tham khảo"/"Bản nháp"; testimonial demo bị repository lọc ở production; `scripts/check-demo.ts` thoát lỗi khi `DEPLOY_ENV=production`.
- Hệ quả: Không thể vô tình đưa số liệu giả lên production.
