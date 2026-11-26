"use client";

import { useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import type { Pricing } from "@/domain/schemas";
import { WaybillLabel } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { QuoteCalculator, type QuoteDestination } from "@/features/quote";
import { TrackingForm } from "@/features/tracking";

type Tab = "quote" | "track";

/** Thẻ 2 tab "Báo giá | Tra cứu" kiểu nhãn vận đơn trong hero (plan mục 6). */
export function HeroCard({
  destinations,
  pricing,
  zaloUrl,
}: {
  destinations: QuoteDestination[];
  pricing: Pricing;
  zaloUrl: string;
}) {
  const t = useTranslations("heroCard");
  const [tab, setTab] = useState<Tab>("quote");
  const tabs: Tab[] = ["quote", "track"];

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = tab === "quote" ? "track" : "quote";
    setTab(next);
    document.getElementById(`hero-tab-${next}`)?.focus();
  };

  return (
    <WaybillLabel to="WORLD" title={t("label")} number="PGX · 0319722024 · SGN">
      <div
        role="tablist"
        aria-label={t("label")}
        className="mb-5 grid grid-cols-2 border-2 border-charcoal-900 dark:border-charcoal-300/40"
      >
        {tabs.map((k) => (
          <button
            key={k}
            id={`hero-tab-${k}`}
            role="tab"
            type="button"
            aria-selected={tab === k}
            aria-controls={`hero-panel-${k}`}
            tabIndex={tab === k ? 0 : -1}
            onClick={() => setTab(k)}
            onKeyDown={onKey}
            className={cn(
              "min-h-11 font-sub text-sm font-semibold tracking-wider uppercase transition-colors",
              tab === k
                ? "bg-charcoal-900 text-ivory-50 dark:bg-ivory-50 dark:text-charcoal-900"
                : "text-label-ink hover:text-brand-strong",
            )}
          >
            {k === "quote" ? t("tabQuote") : t("tabTrack")}
          </button>
        ))}
      </div>
      <div id="hero-panel-quote" role="tabpanel" aria-labelledby="hero-tab-quote" hidden={tab !== "quote"}>
        <QuoteCalculator destinations={destinations} pricing={pricing} compact />
      </div>
      <div id="hero-panel-track" role="tabpanel" aria-labelledby="hero-tab-track" hidden={tab !== "track"}>
        <TrackingForm zaloUrl={zaloUrl} />
      </div>
    </WaybillLabel>
  );
}
