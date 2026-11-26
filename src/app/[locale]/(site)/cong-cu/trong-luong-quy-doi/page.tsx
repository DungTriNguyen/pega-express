import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { getRepositories } from "@/data";
import { PageHeader, Section } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { VolumetricCalculator } from "@/features/quote";
import { PageCrumbs } from "../../_lib/crumbs";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.volumetric" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    hrefByLocale: { vi: "/cong-cu/trong-luong-quy-doi", en: "/cong-cu/trong-luong-quy-doi" },
  });
}

export default async function VolumetricPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const pricing = await (await getRepositories()).pricing.get();
  return (
    <>
      <PageHeader
        eyebrow={`D × R × C ÷ ${pricing.volumetricDivisor}`}
        title={t("pages.volumetric.h1")}
        lead={t("pages.volumetric.explain")}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[{ label: t("nav.volumetric"), href: "/cong-cu/trong-luong-quy-doi" }]}
          />
        }
      />
      <Section>
        <div className="max-w-3xl border border-border bg-surface p-6 sm:p-8">
          <VolumetricCalculator divisor={pricing.volumetricDivisor} />
        </div>
      </Section>
    </>
  );
}
