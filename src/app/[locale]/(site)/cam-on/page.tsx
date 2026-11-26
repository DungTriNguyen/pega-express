import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { zaloUrl } from "@/shared/config/site";
import { Section, Stamp, WaybillLabel, buttonClass } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { TrackedAnchor } from "@/features/analytics";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.thanks" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    hrefByLocale: { vi: "/cam-on", en: "/cam-on" },
    noindex: true,
  });
}

export default async function ThanksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("thanks");
  return (
    <Section>
      <div className="mx-auto max-w-xl py-10">
        <WaybillLabel to="PGX" title="LEAD" number="RECEIVED · SGN">
          <Stamp>{locale === "vi" ? "Đã nhận" : "Received"}</Stamp>
          <h1 className="mt-4 font-display text-display-lg font-extrabold uppercase">{t("title")}</h1>
          <p className="mt-4 text-lg">{t("body")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedAnchor
              event="zalo_click"
              data-location="thanks"
              href={zaloUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("primary", "lg")}
            >
              <MessageCircle aria-hidden className="size-4" /> {t("zalo")}
            </TrackedAnchor>
            <Link href="/" className={buttonClass("secondary", "lg")}>
              {t("home")}
            </Link>
          </div>
        </WaybillLabel>
      </div>
    </Section>
  );
}
