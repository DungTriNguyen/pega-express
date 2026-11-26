# ADR-003: Cloudflare Workers qua @opennextjs/cloudflare

- Trạng thái: Đã chấp nhận
- Bối cảnh: Cần hosting miễn phí giai đoạn đầu, CDN nhanh tại VN, preview mỗi nhánh; Vercel Hobby cấm dùng thương mại.
- Quyết định: Deploy Next.js lên Cloudflare Workers bằng OpenNext; tên miền `*.workers.dev`, gắn domain riêng sau. Ảnh tối ưu sẵn lúc build (không dùng image optimizer runtime).
- Hệ quả: Code server phải chạy được trên Workers (dùng `fetch`/WebCrypto, không thư viện Node nặng). Khi CRM lớn có thể cần Workers Paid (giới hạn 3 MB gói miễn phí).
