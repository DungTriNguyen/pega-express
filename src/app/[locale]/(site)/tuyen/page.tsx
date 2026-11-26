import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { PageHeader, Section } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { DeparturesBoard } from "@/features/destinations";
import { PageCrumbs } from "../_lib/crumbs";
import { loadQuoteData } from "../_lib/page-data";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.destinations" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    hrefByLocale: { vi: "/tuyen", en: "/tuyen" },
  });
}

export default async function DestinationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { boardRows, pricing } = await loadQuoteData(locale);
  return (
    <>
      <PageHeader
        eyebrow={t("routes.eyebrow")}
        title={t("pages.destinations.h1")}
        lead={t("pages.destinations.description")}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[{ label: t("nav.destinations"), href: "/tuyen" }]}
          />
        }
      />
      <Section>
        <DeparturesBoard rows={boardRows} locale={locale} demo={pricing.demo} />
      </Section>
    </>
  );
}
