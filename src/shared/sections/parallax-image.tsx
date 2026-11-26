import type { ReactNode } from "react";

/**
 * Parallax nhẹ (hiệu ứng g): CSS scroll-driven (`.parallax-layer`, globals.css), chỉ transform,
 * tắt khi giảm chuyển động hoặc trình duyệt chưa hỗ trợ. 0 KB JS.
 */
export function ParallaxImage({ children }: { children: ReactNode }) {
  return (
    <div className="h-full overflow-hidden">
      <div className="parallax-layer -mt-[5%] h-[110%]">{children}</div>
    </div>
  );
}
