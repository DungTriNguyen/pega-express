"use client";

import { useEffect, useRef } from "react";

/**
 * Số đếm tăng (hiệu ứng b) — chỉ dùng cho số liệu THẬT.
 * HTML ban đầu đã có số cuối (không phụ thuộc JS). IntersectionObserver + rAF, ~0 KB thư viện.
 */
export function CountUp({
  value,
  className,
  durationMs = 900,
}: {
  value: number;
  className?: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out
          el.textContent = String(Math.round(eased * value));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: "-10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, durationMs]);
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
