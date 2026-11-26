"use client";

import { useEffect, useState } from "react";
import { FileText, MessageCircle, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { track } from "@/features/analytics";
import { cn } from "@/shared/lib/utils";

/** Thanh CTA cố định đáy màn hình mobile: Zalo · Gọi · Báo giá — hiện sau khi cuộn qua hero (plan 4.8). */
export function MobileCtaBar({
  zaloUrl,
  phoneE164,
  labels,
}: {
  zaloUrl: string;
  phoneE164: string;
  labels: { bar: string; zalo: string; call: string; quote: string };
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold";
  return (
    <nav
      aria-label={labels.bar}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex border-t border-charcoal-700 bg-charcoal-900 pb-[env(safe-area-inset-bottom)] text-ivory-50 transition-transform duration-300 ease-out md:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <a
        href={zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={item}
        onClick={() => track("zalo_click", { location: "mobile_bar" })}
      >
        <MessageCircle aria-hidden className="size-5 text-orange-300" />
        {labels.zalo}
      </a>
      <a
        href={`tel:${phoneE164}`}
        className={cn(item, "border-x border-charcoal-700")}
        onClick={() => track("call_click", { location: "mobile_bar" })}
      >
        <Phone aria-hidden className="size-5 text-orange-300" />
        {labels.call}
      </a>
      <Link href="/bao-gia" className={cn(item, "bg-orange-400 text-charcoal-950")}>
        <FileText aria-hidden className="size-5" />
        {labels.quote}
      </Link>
    </nav>
  );
}
