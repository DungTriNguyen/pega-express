"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ResponsiveImage, type ResponsiveImageData } from "@/shared/ui";

/** Gallery kho kéo ngang (hiệu ứng e, Embla). Ảnh thật có nhãn "Ảnh thật". */
export function CapabilityGallery({
  images,
  labels,
}: {
  images: ResponsiveImageData[];
  labels: { real: string; prev: string; next: string };
}) {
  const [ref, api] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" });
  return (
    <div>
      <div ref={ref} className="overflow-hidden">
        <ul className="flex gap-4">
          {images.map((img, i) => (
            <li key={img.id} className="relative min-w-0 shrink-0 basis-[85%] sm:basis-[60%] lg:basis-[42%]">
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden border border-charcoal-700">
                  <ResponsiveImage
                    image={img}
                    sizes="(min-width:1024px) 42vw, (min-width:640px) 60vw, 85vw"
                    className="h-full"
                  />
                  <span className="absolute top-3 left-3 bg-charcoal-950/80 px-2 py-1 font-mono text-[0.65rem] tracking-[0.2em] text-orange-300 uppercase">
                    ◉ {labels.real} · {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <figcaption className="mt-3 text-sm text-charcoal-200">{img.alt}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => api?.scrollPrev()}
          aria-label={labels.prev}
          className="grid size-11 place-items-center border border-charcoal-700 text-ivory-50 hover:border-orange-300"
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => api?.scrollNext()}
          aria-label={labels.next}
          className="grid size-11 place-items-center border border-charcoal-700 text-ivory-50 hover:border-orange-300"
        >
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>
    </div>
  );
}
