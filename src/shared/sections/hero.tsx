import type { ReactNode } from "react";
import { Eyebrow, ResponsiveImage, type ResponsiveImageData } from "@/shared/ui";
import { ParallaxImage } from "./parallax-image";

/**
 * Hero (plan mục 6): ảnh kho thật làm tối + đường bay cam + 1 dòng tiêu đề condensed rất lớn + thẻ Báo giá|Tra cứu.
 * Tiêu đề và thẻ là phần LCP → render ngay ở server; hiệu ứng chạy sau.
 * Khung chừa sẵn chỗ cho video: truyền `video` để thay ảnh, bố cục giữ nguyên.
 */
export function Hero({
  eyebrow,
  title,
  subtitle,
  actions,
  card,
  image,
  routeMap,
  caption,
  video,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions: ReactNode;
  card: ReactNode;
  image: ResponsiveImageData;
  routeMap: ReactNode;
  caption: string;
  video?: { mp4: string; webm?: string; poster: string };
}) {
  return (
    <section className="relative isolate overflow-hidden bg-charcoal-950 text-ivory-50">
      <div className="absolute inset-0 -z-10">
        {video ? (
          <video
            className="h-full w-full object-cover opacity-45"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={video.poster}
          >
            {video.webm && <source src={video.webm} type="video/webm" />}
            <source src={video.mp4} type="video/mp4" />
          </video>
        ) : (
          <ParallaxImage>
            <ResponsiveImage
              image={image}
              priority
              sizes="100vw"
              className="h-full"
              imgClassName="opacity-55 grayscale-[30%]"
              decorative
            />
          </ParallaxImage>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950 via-charcoal-950/85 to-charcoal-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-charcoal-950/60" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 -z-10 text-ivory-50/70 opacity-35 lg:top-6 lg:left-[40%] lg:opacity-80"
      >
        {routeMap}
      </div>

      <div className="container-page grid gap-10 pt-10 pb-16 sm:pt-16 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-14 lg:pt-20 lg:pb-24">
        <div>
          <Eyebrow inverse>{eyebrow}</Eyebrow>
          <h1 className="mt-4 font-display text-display-xl font-extrabold text-balance uppercase">{title}</h1>
          <p className="mt-6 max-w-xl text-lg text-charcoal-200">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
          <p className="mt-10 hidden font-mono text-[0.7rem] tracking-[0.18em] text-charcoal-300 uppercase lg:block">
            ◉ {caption}
          </p>
        </div>
        <div className="text-fg lg:w-full lg:max-w-md lg:justify-self-end">{card}</div>
      </div>
    </section>
  );
}
