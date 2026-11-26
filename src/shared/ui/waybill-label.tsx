import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Khung "nhãn vận đơn hàng không": góc vuông, dải mã tuyến SGN · XXX, mã vạch làm đường kẻ.
 * Chi tiết nhận diện riêng của Pega (plan mục 2.0).
 */
export function WaybillLabel({
  from = "SGN",
  to,
  number,
  title,
  className,
  children,
}: {
  from?: string;
  to: string;
  number?: string;
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative border-2 border-charcoal-900 bg-label text-label-ink shadow-2 dark:border-charcoal-300/40",
        className,
      )}
    >
      <div className="flex items-stretch justify-between border-b-2 border-charcoal-900 font-mono text-xs dark:border-charcoal-300/40">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="font-semibold tracking-widest">{from}</span>
          <span aria-hidden className="text-brand-strong">
            ✈
          </span>
          <span className="font-semibold tracking-widest">{to}</span>
        </div>
        {title && (
          <div className="flex items-center border-l-2 border-charcoal-900 px-3 py-2 tracking-widest uppercase dark:border-charcoal-300/40">
            {title}
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
      {number && (
        <div className="border-t-2 border-dashed border-charcoal-900/50 px-4 pt-2 pb-3 dark:border-charcoal-300/30">
          <div className="barcode-rule text-label-ink" aria-hidden />
          <p className="mt-1 font-mono text-[0.7rem] tracking-[0.3em]">{number}</p>
        </div>
      )}
    </div>
  );
}

export function Stamp({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block -rotate-6 border-2 border-brand-strong px-2 py-0.5 font-mono text-[0.65rem] font-semibold tracking-[0.2em] text-brand-strong uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
