"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { useSlugAlternates } from "./slug-alternates";

/**
 * Đổi ngôn ngữ nhưng GIỮ đúng trang tương ứng — kể cả slug động (tuyến, dịch vụ, chính sách)
 * nhờ bảng slugAlternates sinh từ dữ liệu.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("locale");
  const pathname = usePathname();
  const params = useParams<Record<string, string>>();
  const target: AppLocale = locale === "vi" ? "en" : "vi";
  const slugAlternates = useSlugAlternates();

  const translatedParams: Record<string, string> = {};
  for (const key of ["routeSlug", "serviceSlug", "policySlug"] as const) {
    const value = params?.[key];
    if (value) translatedParams[key] = slugAlternates[key][locale]?.[decodeURIComponent(value)] ?? value;
  }

  // Trang 404 trong route động: không có params hợp lệ → về trang chủ của ngôn ngữ kia
  const isDynamic = pathname.includes("[");
  const href = Object.keys(translatedParams).length
    ? { pathname, params: translatedParams }
    : isDynamic
      ? "/"
      : pathname;

  return (
    <Link
      // next-intl cần pathname + params cho route động
      href={href as never}
      locale={target}
      hrefLang={target}
      lang={target}
      aria-label={`${t("label")}: ${t("switchTo")}`}
      className={
        className ??
        "inline-flex min-h-11 items-center rounded-md px-2 font-mono text-sm font-semibold tracking-widest text-fg hover:text-brand-strong"
      }
    >
      {t("short")}
    </Link>
  );
}
