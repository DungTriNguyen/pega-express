import type { ReactNode } from "react";

/** CTA cuối: nền charcoal + họa tiết cánh (plan mục 5.1 #12). */
export function FinalCta({ title, subtitle, actions }: { title: string; subtitle: string; actions: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-charcoal-900 py-20 text-ivory-50 sm:py-28">
      <svg
        aria-hidden
        viewBox="0 0 600 300"
        className="pointer-events-none absolute -right-20 -bottom-10 w-[36rem] text-orange-400/25"
        fill="none"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M600 ${60 + i * 34} C 420 ${40 + i * 30}, 260 ${120 + i * 22}, ${40 + i * 30} ${250 - i * 6}`}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="relative container-page">
        <h2 className="max-w-4xl font-display text-display-xl font-extrabold uppercase">{title}</h2>
        <p className="mt-5 max-w-xl text-lg text-charcoal-200">{subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
      </div>
    </section>
  );
}
