import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { PageHeader, Section, buttonClass } from "@/shared/ui";
import { ProcessSteps } from "@/shared/sections";
import { buildMetadata } from "@/shared/lib/seo";
import { PageCrumbs } from "../_lib/crumbs";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.process" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    hrefByLocale: { vi: "/quy-trinh-gui-hang", en: "/quy-trinh-gui-hang" },
  });
}

export default async function ProcessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <>
      <PageHeader
        eyebrow={t("process.eyebrow")}
        title={t("pages.process.h1")}
        lead={t("pages.process.description")}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[{ label: t("nav.process"), href: "/quy-trinh-gui-hang" }]}
          />
        }
      />
      <Section tone="inverse">
        <ProcessSteps
          steps={(["1", "2", "3", "4"] as const).map((k) => ({
            title: t(`process.steps.${k}.title`),
            body: t(`process.steps.${k}.body`),
          }))}
        />
        <Link href="/bao-gia" className={buttonClass("primary", "lg", "mt-14")}>
          {t("common.getQuote")} <ArrowRight aria-hidden className="size-4" />
        </Link>
      </Section>
    </>
  );
}
