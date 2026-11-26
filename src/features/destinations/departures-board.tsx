import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Destination } from "@/domain/schemas";
import { CountryCode } from "@/shared/ui";
import { formatVndShort } from "@/shared/lib/utils";

export type BoardRow = Destination & { priceFrom?: number };

/**
 * Danh sách tuyến dạng "bảng giờ bay" (thay cho lưới thẻ — plan mục 2.0).
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
      <div className="hidden grid-cols-[2.5rem_1fr_5rem_7rem_7rem_2.5rem] items-center gap-4 border-b border-charcoal-700 px-5 py-3 font-mono text-[0.7rem] tracking-[0.2em] text-charcoal-300 uppercase md:grid">
        <span aria-hidden />
        <span>{t("colDestination")}</span>
        <span>{t("colCode")}</span>
        <span>
          {t("colPrice")}
          {demo && <sup aria-label={tc("demoPrice")}> *</sup>}
        </span>
        <span>{t("colTransit")}</span>
        <span aria-hidden />
      </div>
      <ul>
        {rows.map((d) => (
          <li key={d.id} className="board-row group relative border-b border-charcoal-700/70 last:border-0">
            <Link
              href={{ pathname: "/[routeSlug]", params: { routeSlug: d.slug[locale] } }}
              className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-4 transition-colors hover:bg-charcoal-800 focus-visible:bg-charcoal-800 sm:px-5 md:grid-cols-[2.5rem_1fr_5rem_7rem_7rem_2.5rem]"
            >
              <CountryCode code={d.id} className="text-orange-300" />
              <span className="font-display text-2xl font-bold tracking-wide uppercase sm:text-3xl">
                {d.name[locale]}
              </span>
              <span className="hidden font-mono text-sm tracking-widest text-charcoal-300 md:block">SGN·{d.iata}</span>
              <span className="col-start-2 font-mono text-sm md:col-start-auto">
                {d.priceFrom ? (
                  <>
                    <span className="text-charcoal-300">{tc("from")} </span>
                    <span className="font-semibold text-orange-300">{formatVndShort(d.priceFrom)}</span>
                    <span className="text-charcoal-300">{tc("perKg")}</span>
                  </>
                ) : (
                  "—"
                )}
              </span>
              <span className="col-start-2 -mt-1 font-mono text-sm text-charcoal-200 md:col-start-auto md:mt-0">
                {tc("days", { min: d.transitDays.min, max: d.transitDays.max })}
              </span>
              <ArrowUpRight
                aria-hidden
                className="col-start-3 row-span-2 row-start-1 size-6 text-charcoal-300 transition-colors group-hover:text-orange-300 md:col-start-auto md:row-span-1 md:row-start-auto"
              />
              <span className="sr-only">{t("viewRoute")}</span>
            </Link>
            <span
              aria-hidden
              className="board-line pointer-events-none absolute bottom-0 left-0 h-0.5 w-full bg-orange-400"
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
