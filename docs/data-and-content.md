# Dữ liệu & nội dung

## Nguồn sự thật

- **Google Sheets** là nơi chủ doanh nghiệp sửa (bảng giá, tuyến, FAQ, đánh giá).
- `scripts/sync-sheets.ts` đọc Sheets (service account **chỉ quyền đọc**) → kiểm tra Zod → ghi `src/content/*.json` → commit → Cloudflare build lại.
- Website **không bao giờ** đọc Sheets lúc khách truy cập.
- Sai định dạng → script dừng, **không ghi file nào**, báo rõ tab + dòng → bản web cũ vẫn chạy.

## Cấu trúc Google Sheet dữ liệu (dòng 1 là tiêu đề cột)

| Tab            | Cột                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Destinations` | `id` (us, au…), `iata`, `name_vi`, `name_en`, `slug_vi`, `slug_en`, `transit_min`, `transit_max`, `summary_vi`, `summary_en`, `notes_vi`, `notes_en`, `demo` |
| `Pricing`      | `destination_id`, `up_to_kg`, `per_kg_vnd`, `demo` — mỗi dòng một mốc cân                                                                                    |
| `Surcharges`   | `goods_type` (general, food, cosmetics, medicine, liquid), `per_kg_vnd`                                                                                      |
| `FAQ`          | `id`, `q_vi`, `q_en`, `a_vi`, `a_en`                                                                                                                         |
| `Testimonials` | `id`, `author`, `destination_vi`, `destination_en`, `rating` (1–5), `text_vi`, `text_en`, `source` (google, facebook, zalo), `demo`                          |

Thành phố/thời gian, danh sách hàng được/không được gửi và FAQ riêng của từng tuyến hiện sửa trực tiếp trong `src/content/destinations.json` (sẽ chuyển sang tab riêng khi cần).

## Cách sửa giá

1. Mở tab `Pricing`, sửa `per_kg_vnd`. Khi là giá thật, đặt cột `demo` = trống/FALSE cho mọi dòng.
2. Bấm nút "Cập nhật website" trong Sheet (Apps Script gọi GitHub `workflow_dispatch` của workflow `sync-content.yml`) — hoặc dev chạy `npm run sync:sheets`.
3. Kiểm tra trang preview, merge PR tự tạo.

## Thêm một nước

Thêm 1 dòng vào `Destinations` + các dòng mốc cân vào `Pricing` → sync. Trang `/gui-hang-di-<slug>` và `/en/ship-to-<slug>` tự sinh, tự vào sitemap, bảng giờ bay, bảng giá. Không sửa code (chỉ cần thêm tọa độ `map` cho bản đồ đường bay trong JSON).

## Dữ liệu demo 🧪

Mọi bản ghi chưa được chủ doanh nghiệp xác nhận có `demo: true`:

- `pricing.json` — bảng giá demo (web hiện nhãn "Giá tham khảo").
- `destinations.json` — thời gian giao demo.
- `testimonials.json` — khung giữ chỗ, **ẩn ở production** (repository lọc bỏ).
- `policies.json` — chính sách bản nháp (`noindex`, không vào sitemap).

`npm run check:demo` liệt kê; khi `DEPLOY_ENV=production` thì **thoát lỗi** → CI/deploy bị chặn.

## Google Sheet "Leads"

Cột: thời gian · họ tên · SĐT/Zalo · email · dịch vụ · nước đến · cân nặng · kích thước · loại hàng · ghi chú · ngôn ngữ · trang nguồn · UTM · đồng ý.

Thiết lập:

1. Google Cloud → tạo project → bật **Google Sheets API** → tạo **service account** → tạo key JSON.
2. Tạo Sheet "Leads" (tab `Leads`, dòng 1 là tiêu đề như trên) → Share cho email service account quyền **Editor** (chỉ sheet này).
3. Sheet dữ liệu: Share cho service account quyền **Viewer**.
4. Đặt biến: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY` (private key, `\n` thay xuống dòng), `GOOGLE_SHEETS_LEADS_ID`, `GOOGLE_SHEETS_CONTENT_ID`.

## Ảnh

- Ảnh gốc đặt ở `assets-src/photos/` (**không commit** — có EXIF/GPS; bản gốc trên Drive "PEGA").
- Khai báo trong `src/content/media.json` (id, file, alt vi/en, `real`). Ảnh AI phải `real: false` và không được trình bày là ảnh thật.
- `npm run images` → `public/media/<id>-<w>.avif|webp` + `src/content/generated/media-manifest.json`.
- HEIC: chuyển sang JPG trước (sharp bản dựng sẵn thường không đọc HEIC).
- Video hero: đặt MP4 (H.264) + WebM ≤ 1,5 MB vào `public/media/` và truyền prop `video` cho `<Hero>`.
