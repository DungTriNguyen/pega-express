# Deploy (Cloudflare Workers + OpenNext)

> Chưa deploy. Các bước dưới đây dùng khi chủ doanh nghiệp đã tạo tài khoản Cloudflare.

## Lần đầu

```bash
npx wrangler login
npm run preview          # build OpenNext + chạy thử runtime Workers cục bộ
npm run deploy           # đặt DEPLOY_ENV=production để chặn nếu còn dữ liệu demo
```

Trang chạy trên `https://pega-express-web.<tài-khoản>.workers.dev`. Bật **Workers Builds** (kết nối GitHub) để mỗi nhánh/PR có link preview.

## Cấu hình Cloudflare Workers Builds (Settings → Build)

| Mục            | Giá trị                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------- |
| Build command  | `npm run build:cf` (= `opennextjs-cloudflare build`, tự gọi `npm run build` bên trong)            |
| Deploy command | `npx wrangler deploy` (wrangler tự nhận ra OpenNext)                                              |
| Biến build     | `DEPLOY_ENV=preview` khi còn dữ liệu demo; `DEPLOY_ENV=production` sẽ **chặn** build nếu còn demo |

Không dùng `npm run build` làm build command: lệnh đó chỉ chạy `next build`, không tạo `.open-next/` → deploy báo "Could not find compiled Open Next config".

> OpenNext cảnh báo hỗ trợ middleware chạy Node.js (`src/proxy.ts` của Next 16) trên Cloudflare còn thử nghiệm. Sau khi deploy cần thử chuyển ngôn ngữ `/en` và các slug tiếng Anh.

## Cache trang trên Workers Free

Mọi trang nội dung được build sẵn và phục vụ từ static assets (`static-assets-incremental-cache` + cache interception, ADR-007) để không vượt giới hạn 10 ms CPU của gói Free. Header `x-opennext-cache: HIT` xác nhận trang được trả từ cache. Đổi nội dung = build + deploy lại; không có ISR.

## Biến môi trường & bí mật

| Biến                                                  | Loại       | Ghi chú                                                                      |
| ----------------------------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| `SITE_URL`                                            | var        | URL gốc; đổi khi gắn domain riêng                                            |
| `DEPLOY_ENV`                                          | var        | `preview` / `production` (production chặn dữ liệu demo, mở index cho robots) |
| `DATA_SOURCE`, `API_BASE_URL`                         | var        | `json` (hiện tại) / `api`                                                    |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                      | build var  | Turnstile site key                                                           |
| `TURNSTILE_SECRET_KEY`                                | **secret** | `npx wrangler secret put TURNSTILE_SECRET_KEY`                               |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`                        | var        |                                                                              |
| `GOOGLE_SERVICE_ACCOUNT_KEY`                          | **secret** | private key                                                                  |
| `GOOGLE_SHEETS_LEADS_ID`, `GOOGLE_SHEETS_LEADS_RANGE` | var        |                                                                              |
| `RESEND_API_KEY`                                      | **secret** | email báo lead                                                               |
| `LEAD_EMAIL_FROM`, `LEAD_EMAIL_TO`                    | var        | `LEAD_EMAIL_TO=pegaexpressvn@gmail.com`                                      |
| `NEXT_PUBLIC_ZALO_OA_URL`                             | build var  | link Zalo OA (để trống dùng zalo.me/<hotline>)                               |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`                      | build var  | Cloudflare Web Analytics                                                     |
| `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`     | build var  | mặc định trống = tắt; có giá trị thì chỉ chạy sau khi khách đồng ý cookie    |

Biến `NEXT_PUBLIC_*` được nhúng lúc build — đặt trong Workers Builds → Build variables.

## Bảo mật

- Header bảo mật (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) khai báo trong `next.config.ts`.
- Bật **Rate Limiting Rule** cho `POST /api/lead` (vd. 10 request/10 phút/IP) — giới hạn trong code chỉ theo từng isolate.
- Repo public: chỉ công khai "giá từ"/giá lẻ, không đưa giá sỉ.

## Gắn domain riêng

Cloudflare → Workers → `pega-express-web` → Settings → Domains & Routes → thêm domain → đổi `SITE_URL` → build lại. Mọi URL tuyệt đối (canonical, sitemap, OG) lấy từ `SITE_URL`.

## Rollback

Cloudflare → Workers → Deployments → chọn bản trước → **Rollback**, hoặc `npx wrangler rollback`.
