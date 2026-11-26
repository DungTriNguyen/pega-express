import Link from "next/link";

/** 404 cho đường dẫn nằm ngoài mọi locale (hiếm gặp vì proxy đã chuẩn hóa URL). */
export default function GlobalNotFound() {
  return (
    <html lang="vi">
      <body
        style={{ fontFamily: "system-ui, sans-serif", background: "#142129", color: "#faf7f2", padding: "4rem 1.5rem" }}
      >
        <h1 style={{ fontSize: "2.5rem", margin: 0 }}>404</h1>
        <p>Không tìm thấy trang · Page not found</p>
        <p>
          <Link href="/" style={{ color: "#f59d71" }}>
            Pega Express — Trang chủ
          </Link>
        </p>
      </body>
    </html>
  );
}
