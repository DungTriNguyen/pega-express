# ADR-002: Lớp repository, dữ liệu JSON hôm nay — REST API ngày mai

- Trạng thái: Đã chấp nhận
- Bối cảnh: Chưa có database/backend; chủ doanh nghiệp muốn tự sửa giá trên Google Sheets; backend REST sẽ có sau.
- Quyết định: Giao diện chỉ phụ thuộc interface trong `src/data/repositories`. Adapter JSON đọc `src/content/*.json` (sinh từ Sheets lúc build); adapter API gọi REST. Chọn bằng `DATA_SOURCE`. Hai adapter chạy chung contract test. JSON có định dạng `{ data, meta }` giống API.
- Hệ quả: Đổi nguồn dữ liệu không sửa UI. Sheets không bao giờ bị đọc lúc khách truy cập.
