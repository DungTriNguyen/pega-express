import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getRepositories } from "@/data";
import { priceFromPerKg, rateTable } from "@/domain/pricing";
import { zaloUrl } from "@/shared/config/site";
import { Badge, CountryCode, FaqList, JsonLd, PageHeader, Section } from "@/shared/ui";
import { buildMetadata, faqSchema, localizedUrl, serviceSchema } from "@/shared/lib/seo";
import { formatDate, formatVnd, formatVndShort } from "@/shared/lib/utils";
import { QuoteCalculator } from "@/features/quote";
import { PageCrumbs } from "../_lib/crumbs";
import { loadQuoteData } from "../_lib/page-data";

type Props = { params: Promise<{ locale: AppLocale; routeSlug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const repos = await getRepositories();
  const list = await repos.destinations.list();
  return routing.locales.flatMap((locale) => list.map((d) => ({ locale, routeSlug: d.slug[locale] })));
}

async function load(locale: AppLocale, slug: string) {
  const repos = await getRepositories();
  const d = await repos.destinations.getBySlug(decodeURIComponent(slug), locale);
  if (!d) notFound();
  return d;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, routeSlug } = await params;
  const d = await load(locale, routeSlug);
  const repos = await getRepositories();
  const price = priceFromPerKg(await repos.pricing.get(), d.id);
  const t = await getTranslations({ locale, namespace: "pages.destination" });
  const vars = {
    country: d.name[locale],
    price: price ? formatVndShort(price) : "",
    min: d.transitDays.min,
    max: d.transitDays.max,
  };
  return buildMetadata({
    locale,
    title: t(price ? "title" : "titleNoPrice", vars),
    description: t(price ? "description" : "descriptionNoPrice", vars),
    hrefByLocale: {
      vi: { pathname: "/[routeSlug]", params: { routeSlug: d.slug.vi } },
      en: { pathname: "/[routeSlug]", params: { routeSlug: d.slug.en } },
    },
  });
}

export default async function DestinationPage({ params }: Props) {
  const { locale, routeSlug } = await params;
  setRequestLocale(locale);
  const d = await load(locale, routeSlug);
  const t = await getTranslations();
  const repos = await getRepositories();
  const [{ pricing, quoteDestinations, destinations }, meta] = await Promise.all([
    loadQuoteData(locale),
    repos.pricing.meta(),
  ]);
  const table = rateTable(pricing, d.id);
  const price = priceFromPerKg(pricing, d.id);
  const country = d.name[locale];
  const faqItems = d.faq.map((f) => ({ id: f.id, q: f.q[locale], a: f.a[locale] }));
  const url = localizedUrl({ pathname: "/[routeSlug]", params: { routeSlug: d.slug[locale] } }, locale);

  return (
    <>
      <JsonLd
        data={[
          faqSchema(faqItems),
          serviceSchema(t("pages.destination.h1", { country }), d.summary[locale], url, country),
        ]}
      />
      <PageHeader
        eyebrow={`SGN ✈ ${d.iata}`}
        title={t("pages.destination.h1", { country })}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[
              { label: t("nav.destinations"), href: "/tuyen" },
              { label: country, href: { pathname: "/[routeSlug]", params: { routeSlug: d.slug[locale] } } },
            ]}
          />
        }
      >
        <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-px border border-charcoal-700 bg-charcoal-700 font-mono sm:grid-cols-3">
          <div className="bg-charcoal-900 p-4">
            <dt className="text-xs tracking-widest text-charcoal-300 uppercase">{t("common.from")}</dt>
            <dd className="mt-1 text-2xl font-semibold text-orange-300">
              {price ? (
                <>
                  {formatVndShort(price)}
                  <span className="text-sm text-charcoal-300">{t("common.perKg")}</span>
                </>
              ) : (
                t("routes.contact")
              )}
            </dd>
          </div>
          <div className="bg-charcoal-900 p-4">
            <dt className="text-xs tracking-widest text-charcoal-300 uppercase">{t("routes.colTransit")}</dt>
            <dd className="mt-1 text-2xl font-semibold">
              {t("common.days", { min: d.transitDays.min, max: d.transitDays.max })}
            </dd>
          </div>
          <div className="col-span-2 bg-charcoal-900 p-4 sm:col-span-1">
            <dt className="text-xs tracking-widest text-charcoal-300 uppercase">{t("routes.colOrigin")}</dt>
            <dd className="mt-1 text-2xl font-semibold">{t("routes.originName")}</dd>
          </div>
        </dl>
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-12">
            <div className="border-l-4 border-brand pl-5">
              <h2 className="font-mono text-xs tracking-[0.2em] text-brand-strong uppercase">
                {t("pages.destination.quickAnswer")}
              </h2>
              <p className="mt-2 text-lg">{d.summary[locale]}</p>
              <p className="mt-2 text-sm text-muted">
                {t("common.updatedAt", { date: formatDate(meta.updatedAt, locale) })}
                {pricing.demo && (
                  <>
                    {" · "}
                    <Badge tone="warning">{t("common.demoPrice")}</Badge>
                  </>
                )}
              </p>
            </div>

            <div>
              <h2 className="font-display text-display-md font-bold uppercase">{t("pages.destination.priceTable")}</h2>
              {table.packages.length === 0 && table.perKg.length === 0 && (
                <p className="mt-4 text-muted">{t("quote.errors.contact_for_price")}</p>
              )}
              {table.packages.length > 0 && (
                <>
                  <h3 className="mt-6 font-sub text-lg font-semibold">{t("pages.destination.packageTitle")}</h3>
                  <ul className="mt-3 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3">
                    {table.packages.map((p) => (
                      <li key={p.kg} className="flex items-baseline justify-between gap-2 bg-surface px-3 py-2">
                        <span className="text-sm text-muted">{p.kg.toLocaleString(locale)} kg</span>
                        <span className="font-mono text-sm font-semibold">{formatVnd(p.price, locale)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {table.perKg.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[22rem] border-collapse text-left">
                    <caption className="sr-only">{t("pages.destination.priceTable")}</caption>
                    <thead>
                      <tr className="border-b-2 border-fg font-mono text-xs tracking-widest uppercase">
                        <th scope="col" className="py-3">
                          {t("pages.destination.weightTier")}
                        </th>
                        <th scope="col" className="py-3 text-right">
                          {t("pages.destination.perKg")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.perKg.map((r) => (
                        <tr key={r.toKg} className="border-b border-border">
                          <th scope="row" className="py-3 font-normal">
                            {`${r.fromKg.toLocaleString(locale)} – ${r.toKg.toLocaleString(locale)} kg`}
                          </th>
                          <td className="py-3 text-right font-mono font-semibold">{formatVnd(r.perKg, locale)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h2 className="font-display text-display-md font-bold uppercase">{t("pages.destination.cities")}</h2>
              <table className="mt-4 w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-fg font-mono text-xs tracking-widest uppercase">
                    <th scope="col" className="py-3">
                      {t("pages.destination.city")}
                    </th>
                    <th scope="col" className="py-3 text-right">
                      {t("pages.destination.transit")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {d.cities.map((c) => (
                    <tr key={c.name.en} className="border-b border-border">
                      <th scope="row" className="py-3 font-normal">
                        {c.name[locale]}
                      </th>
                      <td className="py-3 text-right font-mono">{c.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h2 className="font-sub text-lg font-semibold">{t("pages.destination.allowed")}</h2>
                <ul className="mt-3 space-y-2">
                  {d.allowed.map((a) => (
                    <li key={a.en} className="flex gap-2">
                      <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-success" /> {a[locale]}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-sub text-lg font-semibold">{t("pages.destination.restricted")}</h2>
                <ul className="mt-3 space-y-2">
                  {d.restricted.map((a) => (
                    <li key={a.en} className="flex gap-2">
                      <X aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" /> {a[locale]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border border-border bg-surface-2 p-5">
              <h2 className="font-sub text-lg font-semibold">{t("pages.destination.notes")}</h2>
              <p className="mt-2 text-muted">{d.notes[locale]}</p>
              <Link
                href="/hang-cam-gui"
                className="mt-3 inline-block text-sm font-semibold text-brand-strong underline-offset-4 hover:underline"
              >
                {t("nav.prohibited")} →
              </Link>
            </div>

            <div>
              <h2 className="mb-4 font-display text-display-md font-bold uppercase">
                {t("pages.destination.faq", { country })}
              </h2>
              <FaqList items={faqItems} />
            </div>
          </div>

          <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
            <div className="border border-border bg-surface p-6">
              <h2 className="mb-5 font-sub text-lg font-semibold">{t("pages.destination.quoteFor", { country })}</h2>
              <QuoteCalculator destinations={quoteDestinations} pricing={pricing} initialDestination={d.id} compact />
            </div>
            <p className="mt-4 text-sm text-muted">
              <a href={zaloUrl()} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-strong">
                {t("common.chatZalo")}
              </a>
            </p>
          </aside>
        </div>
      </Section>

      <Section tone="alt" title={t("pages.destination.others")}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {destinations
            .filter((x) => x.id !== d.id)
            .map((x) => (
              <li key={x.id}>
                <Link
                  href={{ pathname: "/[routeSlug]", params: { routeSlug: x.slug[locale] } }}
                  className="flex min-h-14 items-center gap-3 border border-border bg-surface px-4 py-3 font-semibold hover:border-brand-strong"
                >
                  <CountryCode code={x.id} className="text-brand-strong" />
                  {x.name[locale]}
                </Link>
              </li>
            ))}
        </ul>
      </Section>
    </>
  );
}
