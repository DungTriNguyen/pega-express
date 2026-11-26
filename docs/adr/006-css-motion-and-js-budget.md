# ADR-006: Hiệu ứng bằng CSS scroll-driven thay cho thư viện Motion; ngân sách JS

- Trạng thái: Đã chấp nhận (27/11/2026)
- Bối cảnh: Plan v1.4 chọn Motion (`motion/react` + LazyMotion) cho hiệu ứng mức "Cân bằng" và đặt ngân sách JS trang chủ ≤ 120 KB gzip. Đo bản build đầu tiên: trang chủ tải ~310 KB gzip, trong đó Motion ~61 KB (dù dùng LazyMotion, vì `useScroll`/`useTransform`/`animate`/`useInView` kéo gần hết thư viện) và Zod ~31 KB (do client component import hằng số từ file schema).
- Quyết định:
  - Đường nối quy trình, parallax ảnh hero, hiện dần khi cuộn: **CSS scroll-driven animations** (`animation-timeline: view()/scroll()`), có `@supports` + `prefers-reduced-motion`; trình duyệt chưa hỗ trợ thấy nội dung tĩnh đầy đủ.
  - Số đếm tăng: IntersectionObserver + requestAnimationFrame (vài trăm byte).
  - Đường bay hero: SVG + CSS keyframes (như trước).
  - Gỡ gói `motion`. Nếu sau này cần hiệu ứng tương tác phức tạp (CRM, gesture), thêm lại Motion **chỉ trong route cần dùng** và ghi lý do + dung lượng trong PR.
  - Hằng số dùng ở client (`goodsTypes`) tách ra `src/domain/constants.ts` không phụ thuộc Zod.
- Kết quả đo (build production, gzip, trang chủ): **~225 KB**, gồm ~185 KB runtime Next.js 16 + React 19 (react-dom, router) và ~40 KB code ứng dụng (thẻ báo giá/tra cứu, next-intl client, Embla, next-themes).
- Hệ quả: Mục tiêu 120 KB của plan **không đạt được với Next.js App Router** vì riêng runtime framework đã vượt; đây là đánh đổi đã chấp nhận ở ADR-001. Ngân sách thực tế áp dụng: **code ứng dụng ≤ 60 KB gzip trên trang chủ**, tổng ≤ 240 KB; Lighthouse CI giữ ngưỡng hiệu năng. Mọi script nặng (Turnstile, analytics) chỉ tải khi cần/khi đồng ý.
