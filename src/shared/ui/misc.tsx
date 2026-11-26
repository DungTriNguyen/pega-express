import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "warning" | "success";
  className?: string;
}) {
  const tones = {
    neutral: "border-border-strong text-muted",
    brand: "border-brand-strong text-brand-strong",
    warning: "border-warning text-warning",
    success: "border-success text-success",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[0.7rem] font-medium tracking-wider uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Mã nước 2 chữ trong ô vuông kiểu nhãn — thay cờ emoji (Windows không hiển thị cờ emoji) */
export function CountryCode({ code, className }: { code: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid h-8 w-10 shrink-0 place-items-center border border-current font-mono text-xs font-semibold tracking-widest uppercase",
        className,
      )}
    >
      {code}
    </span>
  );
}

/** Đường chia section lấy cảm hứng họa tiết cánh (guideline trang 17) */
export function WingDivider({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 240 24" className={cn("h-6 w-60 text-brand", className)} fill="none">
      <path d="M0 12h86" stroke="currentColor" strokeWidth="2" />
      <path d="M154 12h86" stroke="currentColor" strokeWidth="2" />
      <path
        d="M92 6l12 6-12 6M104 6l12 6-12 6M136 6l-12 6 12 6M148 6l-12 6 12 6"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function DemoNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="note"
      className={cn(
        "inline-flex items-start gap-2 rounded-sm border border-dashed border-warning bg-warning/10 px-3 py-2 text-sm text-warning",
        className,
      )}
    >
      <span aria-hidden className="font-mono font-semibold">
        DEMO
      </span>
      <span>{children}</span>
    </p>
  );
}
