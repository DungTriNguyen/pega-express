"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useTranslations } from "next-intl";

export type TestimonialView = {
  id: string;
  author: string;
  destination: string;
  rating: number;
  text: string;
  source: "google" | "facebook" | "zalo" | "placeholder";
  demo: boolean;
};

/** Carousel kéo ngang (không tự chạy — plan mục 4.10). */
export function TestimonialsCarousel({ items }: { items: TestimonialView[] }) {
  const t = useTranslations("testimonials");
  const tCap = useTranslations("capability");
  const [ref, api] = useEmblaCarousel({ align: "start", dragFree: true });
  return (
    <div>
      <div ref={ref} className="overflow-hidden">
        <ul className="flex gap-4">
          {items.map((it) => (
            <li
              key={it.id}
              className={
                "min-w-0 shrink-0 basis-[85%] border border-border bg-surface p-6 sm:basis-[45%] lg:basis-[32%] " +
                (it.demo ? "border-dashed opacity-80" : "")
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex text-brand" role="img" aria-label={t("rating", { rating: it.rating })}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} aria-hidden className={"size-4 " + (i < it.rating ? "fill-current" : "opacity-30")} />
                  ))}
                </div>
                <span className="font-mono text-[0.7rem] tracking-wider text-muted uppercase">
                  {t(`source.${it.source}`)}
                </span>
              </div>
              <blockquote className="mt-4 text-fg">“{it.text}”</blockquote>
              <p className="mt-4 font-mono text-xs tracking-wider text-muted uppercase">
                {it.author} · SGN → {it.destination}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => api?.scrollPrev()}
          aria-label={tCap("prev")}
          className="grid size-11 place-items-center border border-border-strong hover:border-brand-strong"
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => api?.scrollNext()}
          aria-label={tCap("next")}
          className="grid size-11 place-items-center border border-border-strong hover:border-brand-strong"
        >
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>
    </div>
  );
}
