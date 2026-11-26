import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { getRepositories } from "@/data";
import { site, zaloUrl } from "@/shared/config/site";
import { PageHeader, Section } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { QuoteCalculator } from "@/features/quote";
import { LeadForm } from "@/features/lead";
import { PageCrumbs } from "../_lib/crumbs";
import { loadQuoteData } from "../_lib/page-data";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.quote" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    hrefByLocale: { vi: "/bao-gia", en: "/bao-gia" },
  });
}

export default async function QuotePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { pricing, quoteDestinations } = await loadQuoteData(locale);
  const policies = await (await getRepositories()).content.policies();
  const privacy = policies.find((p) => p.id === "privacy")!;

  return (
    <>
      <PageHeader
        eyebrow={t("nav.quote")}
        title={t("pages.quote.h1")}
        lead={t("pages.quote.description")}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[{ label: t("nav.quote"), href: "/bao-gia" }]}
          />
        }
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="border border-border bg-surface p-6 sm:p-8">
            <QuoteCalculator destinations={quoteDestinations} pricing={pricing} />
          </div>
          <div
            id="lead-form"
            className="scroll-mt-28 border-2 border-charcoal-900 bg-surface p-6 sm:p-8 dark:border-charcoal-700"
          >
            <h2 className="font-display text-display-md font-bold uppercase">{t("lead.title")}</h2>
            <p className="mt-2 mb-6 text-muted">{t("lead.subtitle")}</p>
            <LeadForm
              destinations={quoteDestinations.map((d) => ({ id: d.id, name: d.name }))}
              privacySlug={privacy.slug[locale]}
              zaloUrl={zaloUrl()}
              phoneHref={`tel:${site.phone.e164}`}
              phoneDisplay={site.phone.display}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
