import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { getRepositories } from "@/data";
import { messengerUrl, site, zaloUrl } from "@/shared/config/site";
import { PageHeader, Section } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { LeadForm } from "@/features/lead";
import { TrackedAnchor } from "@/features/analytics";
import { PageCrumbs } from "../_lib/crumbs";
import { loadQuoteData } from "../_lib/page-data";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.contact" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    hrefByLocale: { vi: "/lien-he", en: "/lien-he" },
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { quoteDestinations } = await loadQuoteData(locale);
  const privacy = (await (await getRepositories()).content.policies()).find((p) => p.id === "privacy")!;
  const row = "flex gap-4 border-b border-border py-5";
  return (
    <>
      <PageHeader
        title={t("pages.contact.h1")}
        lead={t("pages.contact.description")}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[{ label: t("nav.contact"), href: "/lien-he" }]}
          />
        }
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="font-display text-display-md font-bold uppercase">{t("pages.contact.visit")}</h2>
            <ul className="mt-4">
              <li className={row}>
                <Phone aria-hidden className="size-6 shrink-0 text-brand-strong" />
                <div>
                  <p className="text-sm text-muted">Hotline / Zalo</p>
                  <TrackedAnchor
                    event="call_click"
                    data-location="contact"
                    href={`tel:${site.phone.e164}`}
                    className="font-mono text-2xl font-semibold hover:text-brand-strong"
                  >
                    {site.phone.display}
                  </TrackedAnchor>
                </div>
              </li>
              <li className={row}>
                <MessageCircle aria-hidden className="size-6 shrink-0 text-brand-strong" />
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <TrackedAnchor
                    event="zalo_click"
                    data-location="contact"
                    href={zaloUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:text-brand-strong"
                  >
                    Zalo
                  </TrackedAnchor>
                  <TrackedAnchor
                    event="messenger_click"
                    data-location="contact"
                    href={messengerUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:text-brand-strong"
                  >
                    Messenger
                  </TrackedAnchor>
                </div>
              </li>
              <li className={row}>
                <Mail aria-hidden className="size-6 shrink-0 text-brand-strong" />
                <a href={`mailto:${site.email}`} className="font-semibold hover:text-brand-strong">
                  {site.email}
                </a>
              </li>
              <li className={row}>
                <MapPin aria-hidden className="size-6 shrink-0 text-brand-strong" />
                <div>
                  <p className="font-semibold">
                    {site.operatingAddress.street}, {site.operatingAddress.ward},{" "}
                    {locale === "vi" ? site.operatingAddress.city : site.operatingAddress.cityEn}
                  </p>
                  <p className="font-mono text-xs text-muted">Plus code {site.operatingAddress.plusCode}</p>
                  <a
                    href={site.operatingAddress.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-brand-strong underline-offset-4 hover:underline"
                  >
                    {t("footer.map")} ↗
                  </a>
                </div>
              </li>
              <li className={row}>
                <Clock aria-hidden className="size-6 shrink-0 text-brand-strong" />
                <p className="font-mono font-semibold">{site.hours.display}</p>
              </li>
            </ul>
            <iframe
              title={t("footer.map")}
              src={`https://www.google.com/maps?q=${site.operatingAddress.geo.lat},${site.operatingAddress.geo.lng}&z=16&output=embed`}
              className="mt-6 aspect-[4/3] w-full border border-border grayscale-[30%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="border-2 border-charcoal-900 bg-surface p-6 sm:p-8 dark:border-charcoal-700">
            <h2 className="font-display text-display-md font-bold uppercase">{t("pages.contact.form")}</h2>
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
