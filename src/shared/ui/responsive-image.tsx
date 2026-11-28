import { cn } from "@/shared/lib/utils";

export type ResponsiveImageData = {
  id: string;
  width: number;
  height: number;
  widths: number[];
  blurDataURL: string;
  alt: string;
  /** false = hình minh họa (không phải ảnh chụp thật) — hiển thị nhãn tương ứng */
  real?: boolean;
};

/**
 * <picture> AVIF + WebP + srcset + sizes. Ảnh đã tối ưu sẵn bởi scripts/optimize-images.ts
 * (không dùng bộ tối ưu runtime của Next trên Cloudflare — plan mục 4.7).
 */
export function ResponsiveImage({
  image,
  sizes = "100vw",
  priority = false,
  className,
  imgClassName,
  decorative = false,
}: {
  image: ResponsiveImageData;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  decorative?: boolean;
}) {
  const srcset = (ext: "avif" | "webp") => image.widths.map((w) => `/media/${image.id}-${w}.${ext} ${w}w`).join(", ");
  const fallback = `/media/${image.id}-${image.widths.at(-1)}.webp`;
  return (
    <picture className={cn("block overflow-hidden", className)}>
      <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcset("webp")} sizes={sizes} />
      <img
        src={fallback}
        alt={decorative ? "" : image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={cn("media-img h-full w-full object-cover", imgClassName)}
        style={{ backgroundImage: `url(${image.blurDataURL})`, backgroundSize: "cover" }}
      />
    </picture>
  );
}
