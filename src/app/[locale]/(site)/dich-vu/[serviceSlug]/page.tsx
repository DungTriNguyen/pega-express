import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getRepositories } from "@/data";
import { site } from "@/shared/config/site";
import { JsonLd, PageHeader, Section, buttonClass } from "@/shared/ui";
import { buildMetadata, localizedUrl, serviceSchema } from "@/shared/lib/seo";
import { PageCrumbs } from "../../_lib/crumbs";

type Props = { params: Promise<{ locale: AppLocale; serviceSlug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const list = await (await getRepositories()).services.list();
  return routing.locales.flatMap((locale) => list.map((s) => ({ locale, serviceSlug: s.slug[locale] })));
}

async function load(locale: AppLocale, slug: string) {
  const s = await (await getRepositories()).services.getBySlug(decodeURIComponent(slug), locale);
  if (!s) notFound();
  return s;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, serviceSlug } = await params;
  const s = await load(locale, serviceSlug);
  return buildMetadata({
    locale,
    title: s.name[locale],
    description: `${s.short[locale]} ${s.body[0]?.[locale] ?? ""}`.slice(0, 160),
    hrefByLocale: {
      vi: { pathname: "/dich-vu/[serviceSlug]", params: { serviceSlug: s.slug.vi } },
      en: { pathname: "/dich-vu/[serviceSlug]", params: { serviceSlug: s.slug.en } },
    },
  });
}

export default async function ServicePage({ params }: Props) {
  const { locale, serviceSlug } = await params;
  setRequestLocale(locale);
  const s = await load(locale, serviceSlug);
  const t = await getTranslations();
  const href = { pathname: "/dich-vu/[serviceSlug]" as const, params: { serviceSlug: s.slug[locale] } };
  return (
    <>
      <JsonLd data={serviceSchema(s.name[locale], s.short[locale], localizedUrl(href, locale))} />
      <PageHeader
        eyebrow={t("services.eyebrow")}
        title={s.name[locale]}
        lead={s.short[locale]}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[
              { label: t("nav.services"), href: "/dich-vu" },
              { label: s.name[locale], href },
            ]}
          />
        }
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5 text-lg">
            {s.body.map((p) => (
              <p key={p.en}>{p[locale]}</p>
            ))}
            {s.id === "domestic" && (
              <ul className="flex flex-wrap gap-2 pt-2">
                {(locale === "vi" ? site.domesticCities : site.domesticCitiesEn).map((c) => (
                  <li key={c} className="border border-border-strong px-3 py-1 font-mono text-sm">
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border border-border bg-surface p-6">
            <ul className="space-y-3">
              {s.points.map((p) => (
                <li key={p.en} className="flex gap-3">
                  <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-strong" /> {p[locale]}
                </li>
              ))}
            </ul>
            <Link href="/bao-gia" className={buttonClass("primary", "lg", "mt-6 w-full")}>
              {t("common.getQuote")} <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
