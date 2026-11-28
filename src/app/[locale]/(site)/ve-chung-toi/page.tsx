import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { site } from "@/shared/config/site";
import { PageHeader, ResponsiveImage, Section, WingDivider } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { formatDate } from "@/shared/lib/utils";
import { PageCrumbs } from "../_lib/crumbs";
import { loadImages } from "../_lib/page-data";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    hrefByLocale: { vi: "/ve-chung-toi", en: "/ve-chung-toi" },
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const images = await loadImages(locale);
  const photo = images.find((i) => i.id === "company") ?? images[0]!;
  const facts: [string, string][] = [
    [t("pages.about.legalName"), site.legalName],
    [t("pages.about.intlName"), site.internationalName],
    [t("pages.about.taxId"), site.taxId],
    [t("pages.about.founded"), formatDate(site.foundingDate, locale)],
    [t("pages.about.representative"), site.representative],
    [
      t("pages.about.operating"),
      `${site.operatingAddress.street}, ${site.operatingAddress.ward}, ${locale === "vi" ? site.operatingAddress.city : site.operatingAddress.cityEn}`,
    ],
    [t("pages.about.registered"), site.registeredAddress],
    [t("pages.about.phone"), site.phone.display],
    [t("pages.about.email"), site.email],
  ];
  return (
    <>
      <PageHeader
        title={t("pages.about.h1")}
        lead={t("pages.about.lead")}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[{ label: t("nav.about"), href: "/ve-chung-toi" }]}
          />
        }
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-display-md font-bold uppercase">{t("pages.about.facts")}</h2>
            <dl className="mt-6 divide-y divide-border border-y border-border">
              {facts.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]">
                  <dt className="font-mono text-xs tracking-wider text-muted uppercase">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figure>
            <ResponsiveImage
              image={photo}
              sizes="(min-width:1024px) 50vw, 100vw"
              className="aspect-[4/3] border border-border"
            />
            <figcaption className="mt-2 font-mono text-xs text-muted">
              ◉ {photo.real ? t("capability.realBadge") : t("capability.illustrationBadge")} — {photo.alt}
            </figcaption>
          </figure>
        </div>
      </Section>
      <Section tone="inverse">
        <WingDivider className="text-orange-400" />
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {(
            [
              ["mission", "missionText"],
              ["vision", "visionText"],
              ["story", "storyText"],
            ] as const
          ).map(([h, b]) => (
            <div key={h}>
              <h2 className="font-display text-3xl font-bold text-orange-300 uppercase">{t(`pages.about.${h}`)}</h2>
              <p className="mt-3 text-charcoal-200">{t(`pages.about.${b}`)}</p>
            </div>
          ))}
        </div>
        <h2 className="mt-14 font-mono text-xs tracking-[0.2em] text-orange-300 uppercase">
          {t("pages.about.values")}
        </h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {(["speed", "trust", "connect", "breakthrough", "together"] as const).map((k) => (
            <li key={k} className="border border-charcoal-700 px-4 py-2 font-display text-xl font-bold uppercase">
              {t(`why.items.${k}.title`)}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
