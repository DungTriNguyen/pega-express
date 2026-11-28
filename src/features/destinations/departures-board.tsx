import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Destination } from "@/domain/schemas";
import { formatVndShort } from "@/shared/lib/utils";

export type BoardRow = Destination & { priceFrom?: number };

const cols = "md:grid-cols-[8rem_1fr_9rem_10rem_2.5rem]";

/**
 * Danh sách tuyến dạng "bảng giờ bay": Điểm gửi (TP.HCM) · Điểm đến · Giá từ · Thời gian dự kiến.
 * Rê chuột / focus → đường bay cam sáng lên.
 */
export async function DeparturesBoard({
  rows,
  locale,
  demo,
}: {
  rows: BoardRow[];
  locale: "vi" | "en";
  demo: boolean;
}) {
  const t = await getTranslations("routes");
  const tc = await getTranslations("common");
  return (
    <div className="overflow-hidden border-2 border-charcoal-900 bg-charcoal-900 text-ivory-50 dark:border-charcoal-700">
      <div
        className={`hidden items-center gap-4 border-b border-charcoal-700 px-5 py-3 font-mono text-[0.7rem] tracking-[0.2em] text-charcoal-300 uppercase md:grid ${cols}`}
      >
        <span>{t("colOrigin")}</span>
        <span>{t("colDestination")}</span>
        <span>
          {t("colPrice")}
          {demo && <sup aria-label={tc("demoPrice")}> *</sup>}
        </span>
        <span>{t("colTransit")}</span>
        <span aria-hidden />
      </div>
      <div className="flex items-center justify-between gap-3 border-b border-charcoal-700 px-4 py-2.5 font-mono text-[0.68rem] tracking-[0.18em] text-charcoal-300 uppercase md:hidden">
        <span>
          {t("colOrigin")}: <span className="text-orange-300">{t("originName")}</span>
        </span>
        <span>
          {t("colPrice")}
          {demo && <sup aria-label={tc("demoPrice")}> *</sup>}
        </span>
      </div>
      <ul>
        {rows.map((d) => (
          <li key={d.id} className="board-row group relative border-b border-charcoal-700/70 last:border-0">
            <Link
              href={{ pathname: "/[routeSlug]", params: { routeSlug: d.slug[locale] } }}
              className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-charcoal-800 focus-visible:bg-charcoal-800 sm:px-5 md:grid md:gap-4 md:py-4 ${cols}`}
            >
              <span className="hidden font-mono text-sm tracking-widest text-charcoal-300 uppercase md:block">
                {t("originName")}
                <span className="sr-only"> → </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="sr-only md:hidden">{t("originName")} → </span>
                <span className="block truncate font-display text-xl font-bold tracking-wide uppercase sm:text-2xl md:text-3xl">
                  {d.name[locale]}
                </span>
                <span className="block font-mono text-xs text-charcoal-300 md:hidden">
                  {tc("days", { min: d.transitDays.min, max: d.transitDays.max })}
                </span>
              </span>
              <span className="shrink-0 text-right font-mono text-sm md:text-left">
                {d.priceFrom ? (
                  <>
                    <span className="text-charcoal-300">{tc("from")} </span>
                    <span className="font-semibold text-orange-300">{formatVndShort(d.priceFrom)}</span>
                    <span className="text-charcoal-300">{tc("perKg")}</span>
                  </>
                ) : (
                  <span className="text-orange-300">{t("contact")}</span>
                )}
              </span>
              <span className="hidden font-mono text-sm text-charcoal-200 md:block">
                {tc("days", { min: d.transitDays.min, max: d.transitDays.max })}
              </span>
              <ArrowUpRight
                aria-hidden
                className="size-5 shrink-0 text-charcoal-300 transition-colors group-hover:text-orange-300 md:size-6"
              />
              <span className="sr-only">{t("viewRoute")}</span>
            </Link>
            <span
              aria-hidden
              className="board-line pointer-events-none absolute bottom-0 left-0 hidden h-0.5 w-full bg-orange-400 md:block"
            />
          </li>
        ))}
      </ul>
      {demo && (
        <p className="border-t border-charcoal-700 px-5 py-2 font-mono text-[0.7rem] text-charcoal-300">
          * {tc("demoBadge")}
        </p>
      )}
    </div>
  );
}
