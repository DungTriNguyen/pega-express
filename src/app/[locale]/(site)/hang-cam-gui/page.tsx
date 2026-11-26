import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle, Ban } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { getRepositories } from "@/data";
import { zaloUrl } from "@/shared/config/site";
import { PageHeader, Section, buttonClass } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { PageCrumbs } from "../_lib/crumbs";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.prohibited" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    hrefByLocale: { vi: "/hang-cam-gui", en: "/hang-cam-gui" },
  });
}

export default async function ProhibitedPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const groups = await (await getRepositories()).content.prohibited();
  return (
    <>
      <PageHeader
        title={t("pages.prohibited.h1")}
        lead={t("pages.prohibited.intro")}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[{ label: t("nav.prohibited"), href: "/hang-cam-gui" }]}
          />
        }
      />
      <Section>
        <div className="grid gap-8 md:grid-cols-2">
          {groups.map((g) => {
            const Icon = g.level === "banned" ? Ban : AlertTriangle;
            return (
              <section key={g.id} aria-labelledby={`pg-${g.id}`} className="border border-border bg-surface p-6">
                <h2 id={`pg-${g.id}`} className="flex items-center gap-3 font-display text-2xl font-bold uppercase">
                  <Icon aria-hidden className={g.level === "banned" ? "size-6 text-danger" : "size-6 text-warning"} />
                  {g.title[locale]}
                </h2>
                <ul className="mt-4 space-y-2">
                  {g.items.map((it) => (
                    <li key={it.en} className="border-b border-border pb-2 last:border-0">
                      {it[locale]}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        <a href={zaloUrl()} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg", "mt-10")}>
          {t("common.chatZalo")}
        </a>
      </Section>
    </>
  );
}
