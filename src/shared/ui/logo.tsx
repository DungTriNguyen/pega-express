import { cn } from "@/shared/lib/utils";

/**
 * Logo ngang. Bản màu cho nền sáng, bản âm trắng cho nền tối (guideline trang 12).
 * TODO(brand): thay bằng SVG xuất từ "LOGO PEGA - DONE.ai" khi có (plan mục 2.5).
 * Tỉ lệ ảnh gốc ≈ 3.7 : 1.
 */
export function Logo({
  variant = "auto",
  className,
  priority = false,
  alt = "Pega Express",
}: {
  variant?: "auto" | "color" | "white";
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const img = (src: string, extra?: string) => (
    // eslint-disable-next-line @next/next/no-img-element -- logo tĩnh nhỏ, đã tối ưu
    <img
      src={`/brand/${src}.webp`}
      alt={alt}
      width={443}
      height={120}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={cn("h-full w-auto", extra)}
    />
  );
  if (variant === "color") return <span className={cn("block h-10", className)}>{img("logo-horizontal")}</span>;
  if (variant === "white") return <span className={cn("block h-10", className)}>{img("logo-horizontal-white")}</span>;
  return (
    <span className={cn("block h-10", className)}>
      {img("logo-horizontal", "dark:hidden")}
      {img("logo-horizontal-white", "hidden dark:block")}
    </span>
  );
}
