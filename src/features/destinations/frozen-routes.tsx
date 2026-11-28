import { Check, Snowflake } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Destination, Pricing } from "@/domain/schemas";
import { formatVndShort } from "@/shared/lib/utils";

const freeKeys = ["box", "bag", "gel", "freeze"] as const;

/**
 * Tuyến đông lạnh: danh sách quyền lợi đóng gói miễn phí + bảng giá từ mỗi kg theo tuyến.
 * Tuyến không có giá trong dữ liệu → "Liên hệ báo giá".
 */
export async function FrozenRoutes({
  pricing,
  destinations,
  locale,
}: {
  pricing: Pricing;
  destinations: Destination[];
  locale: "vi" | "en";
}) {
  const t = await getTranslations("frozen");
  const tr = await getTranslations("routes");
  const tc = await getTranslations("common");
  const rows = pricing.frozen
    .map((f) => ({ ...f, dest: destinations.find((d) => d.id === f.destinationId) }))
    .filter((r): r is typeof r & { dest: Destination } => Boolean(r.dest));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <div className="border border-border bg-surface p-6 sm:p-8">
        <Snowflake aria-hidden className="size-8 text-brand-strong" />
        <h3 className="mt-5 font-display text-2xl font-bold uppercase">{t("freeTitle")}</h3>
        <ul className="mt-5 space-y-3">
          {freeKeys.map((k) => (
            <li key={k} className="flex items-start gap-3">
              <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-strong" />
              <span>{t(`free.${k}`)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{t("title")}</caption>
          <thead className="bg-charcoal-900 text-ivory-50">
            <tr className="font-mono text-xs tracking-widest uppercase">
              <th scope="col" className="hidden px-4 py-3 sm:table-cell">
                {tr("colOrigin")}
              </th>
              <th scope="col" className="px-4 py-3">
                {tr("colDestination")}
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                {tr("colPrice")}
                {pricing.demo && <sup aria-label={tc("demoPrice")}> *</sup>}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.destinationId} className="border-b border-border even:bg-surface-2">
                <td className="hidden px-4 py-3 font-mono text-sm text-muted sm:table-cell">{tr("originName")}</td>
                <th scope="row" className="px-4 py-3 font-semibold">
                  <Link
                    href={{ pathname: "/[routeSlug]", params: { routeSlug: r.dest.slug[locale] } }}
                    className="hover:text-brand-strong"
                  >
                    {r.dest.name[locale]}
                  </Link>
                </th>
                <td className="px-4 py-3 text-right font-mono text-sm">
                  {r.fromPerKg ? (
                    <>
                      <span className="text-muted">{tc("from")} </span>
                      <span className="font-semibold text-brand-strong">{formatVndShort(r.fromPerKg)}</span>
                      <span className="text-muted">{tc("perKg")}</span>
                      {r.minKg && <span className="block text-xs text-muted">{t("minKg", { kg: r.minKg })}</span>}
                    </>
                  ) : (
                    <span className="text-brand-strong">{t("contact")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pricing.demo && <p className="px-4 py-2 font-mono text-[0.7rem] text-muted">* {tc("demoBadge")}</p>}
      </div>
    </div>
  );
}
