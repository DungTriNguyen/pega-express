import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { zaloUrl } from "@/shared/config/site";
import { PageHeader, Section } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { TrackingForm } from "@/features/tracking";
import { PageCrumbs } from "../_lib/crumbs";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.tracking" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    hrefByLocale: { vi: "/tra-cuu", en: "/tra-cuu" },
  });
}

export default async function TrackingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <>
      <PageHeader
        eyebrow="DHL · FedEx · UPS"
        title={t("pages.tracking.h1")}
        lead={t("tracking.subtitle")}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[{ label: t("nav.tracking"), href: "/tra-cuu" }]}
          />
        }
      />
      <Section>
        <div className="max-w-2xl border border-border bg-surface p-6 sm:p-8">
          <TrackingForm zaloUrl={zaloUrl()} showTimeline />
        </div>
      </Section>
    </>
  );
}
