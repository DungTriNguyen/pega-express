import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getRepositories } from "@/data";
import { PageHeader, Section } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { PageCrumbs } from "../_lib/crumbs";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.services" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    hrefByLocale: { vi: "/dich-vu", en: "/dich-vu" },
  });
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const services = await (await getRepositories()).services.list();
  return (
    <>
      <PageHeader
        eyebrow={t("services.eyebrow")}
        title={t("pages.services.h1")}
        lead={t("pages.services.description")}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[{ label: t("nav.services"), href: "/dich-vu" }]}
          />
        }
      />
      <Section>
        <ul className="divide-y divide-border border-y border-border">
          {services.map((s, i) => (
            <li key={s.id}>
              <Link
                href={{ pathname: "/dich-vu/[serviceSlug]", params: { serviceSlug: s.slug[locale] } }}
                className="group grid gap-4 py-8 md:grid-cols-[4rem_1fr_2fr_auto] md:items-center"
              >
                <span className="font-mono text-sm text-brand-strong">0{i + 1}</span>
                <h2 className="font-display text-3xl font-bold uppercase">{s.name[locale]}</h2>
                <p className="text-muted">{s.short[locale]}</p>
                <ArrowRight aria-hidden className="size-6 transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
