import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getRepositories } from "@/data";
import { goodsTypes } from "@/domain/schemas";
import { DemoNotice, PageHeader, Section, buttonClass } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { formatDate, formatVnd } from "@/shared/lib/utils";
import { PageCrumbs } from "../_lib/crumbs";
import { loadQuoteData } from "../_lib/page-data";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.pricing" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    hrefByLocale: { vi: "/bang-gia", en: "/bang-gia" },
  });
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { pricing, destinations } = await loadQuoteData(locale);
  const meta = await (await getRepositories()).pricing.meta();
  // Các mốc cân chung (lấy từ tuyến đầu tiên — mọi tuyến dùng cùng mốc)
  const tiers = pricing.rates[destinations[0]!.id]!.map((b) => b.upToKg);

  return (
    <>
      <PageHeader
        eyebrow={t("common.updatedAt", { date: formatDate(meta.updatedAt, locale) })}
        title={t("pages.pricing.h1")}
        lead={t("pages.pricing.intro")}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[{ label: t("nav.pricing"), href: "/bang-gia" }]}
          />
        }
      />
      <Section>
        {pricing.demo && <DemoNotice className="mb-6">{t("common.demoBadge")}</DemoNotice>}
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <caption className="sr-only">{t("pages.pricing.h1")} (VND/kg)</caption>
            <thead className="bg-charcoal-900 text-ivory-50">
              <tr className="font-mono text-xs tracking-widest uppercase">
                <th scope="col" className="sticky left-0 bg-charcoal-900 px-4 py-3">
                  {t("routes.colDestination")}
                </th>
                {tiers.map((kg, i) => (
                  <th key={kg} scope="col" className="px-4 py-3 text-right">
                    {i === 0 ? `0,5–${kg}` : `${tiers[i - 1]}–${kg}`} kg
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right">
                  {t("routes.colTransit")}
                </th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((d) => (
                <tr key={d.id} className="border-b border-border even:bg-surface-2">
                  <th scope="row" className="sticky left-0 bg-inherit px-4 py-3 font-semibold">
                    <Link
                      href={{ pathname: "/[routeSlug]", params: { routeSlug: d.slug[locale] } }}
                      className="hover:text-brand-strong"
                    >
                      {d.name[locale]}
                    </Link>
                  </th>
                  {(pricing.rates[d.id] ?? []).map((b) => (
                    <td key={b.upToKg} className="px-4 py-3 text-right font-mono text-sm">
                      {formatVnd(b.perKg, locale)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {t("common.days", { min: d.transitDays.min, max: d.transitDays.max })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-14 font-display text-display-md font-bold uppercase">{t("pages.pricing.surcharges")}</h2>
        <table className="mt-4 w-full max-w-xl border-collapse text-left">
          <tbody>
            {goodsTypes.map((g) => (
              <tr key={g} className="border-b border-border">
                <th scope="row" className="py-3 font-normal">
                  {t(`quote.goods.${g}`)}
                </th>
                <td className="py-3 text-right font-mono">
                  {pricing.surchargePerKg[g] ? `+${formatVnd(pricing.surchargePerKg[g]!, locale)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-6 max-w-2xl text-sm text-muted">{t("quote.disclaimer")}</p>
        <Link href="/bao-gia" className={buttonClass("primary", "lg", "mt-8")}>
          {t("common.getQuote")} <ArrowRight aria-hidden className="size-4" />
        </Link>
      </Section>
    </>
  );
}
