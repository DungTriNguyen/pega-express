import type { ReactNode } from "react";
import "./globals.css";

/** Layout gốc chỉ chuyển tiếp — <html> nằm ở app/[locale]/layout.tsx để đặt đúng thuộc tính lang. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
