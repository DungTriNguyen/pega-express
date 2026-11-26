import { notFound } from "next/navigation";

/** Bắt mọi đường dẫn không tồn tại trong locale → hiển thị not-found.tsx đã dịch. */
export default function CatchAll() {
  notFound();
}
