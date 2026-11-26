import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Policy, Service } from "@/domain/schemas";
import { Logo } from "@/shared/ui";
import { site } from "@/shared/config/site";
import { CookieSettingsButton } from "@/features/consent";

export async function Footer({
  locale,
  services,
  policies,
}: {
  locale: "vi" | "en";
  services: Service[];
  policies: Policy[];
}) {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const year = 2026;
  const linkCls = "hover:text-orange-300 transition-colors";
  return (
    <footer className="bg-charcoal-950 pt-16 pb-28 text-charcoal-200 md:pb-12">
      <div className="container-page grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo variant="white" className="h-10" />
          <p className="mt-5 max-w-sm text-sm">{t("about")}</p>
          <p className="mt-3 text-xs text-charcoal-300">{t("notAffiliated")}</p>
          <ul className="mt-5 flex gap-4 text-sm">
            <li>
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className={linkCls}>
                Facebook
              </a>
            </li>
            <li>
              <a href={site.social.tiktok} target="_blank" rel="noopener noreferrer" className={linkCls}>
                TikTok
              </a>
            </li>
          </ul>
        </div>

        <address className="not-italic">
          <h2 className="font-mono text-xs tracking-[0.2em] text-orange-300 uppercase">{t("contact")}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-charcoal-300">{t("operating")}</dt>
              <dd className="text-ivory-50">
                {site.operatingAddress.street}, {site.operatingAddress.ward},{" "}
                {locale === "vi" ? site.operatingAddress.city : site.operatingAddress.cityEn}
              </dd>
              <dd>
                <a
                  href={site.operatingAddress.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkCls} underline underline-offset-4`}
                >
                  {t("map")}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-charcoal-300">Hotline / Zalo</dt>
              <dd>
                <a href={`tel:${site.phone.e164}`} className={`${linkCls} font-mono text-ivory-50`}>
                  {site.phone.display}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-charcoal-300">Email</dt>
              <dd>
                <a href={`mailto:${site.email}`} className={linkCls}>
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-charcoal-300">{t("hours")}</dt>
              <dd className="font-mono">{site.hours.display}</dd>
            </div>
          </dl>
        </address>

        <nav aria-label={t("services")}>
          <h2 className="font-mono text-xs tracking-[0.2em] text-orange-300 uppercase">{t("services")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {services.map((s) => (
              <li key={s.id}>
                <Link
                  href={{ pathname: "/dich-vu/[serviceSlug]", params: { serviceSlug: s.slug[locale] } }}
                  className={linkCls}
                >
                  {s.name[locale]}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/tuyen" className={linkCls}>
                {tn("destinations")}
              </Link>
            </li>
            <li>
              <Link href="/bang-gia" className={linkCls}>
                {tn("pricing")}
              </Link>
            </li>
            <li>
              <Link href="/hang-cam-gui" className={linkCls}>
                {tn("prohibited")}
              </Link>
            </li>
            <li>
              <Link href="/cong-cu/trong-luong-quy-doi" className={linkCls}>
                {tn("volumetric")}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t("company")}>
          <h2 className="font-mono text-xs tracking-[0.2em] text-orange-300 uppercase">{t("company")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/ve-chung-toi" className={linkCls}>
                {tn("about")}
              </Link>
            </li>
            <li>
              <Link href="/quy-trinh-gui-hang" className={linkCls}>
                {tn("process")}
              </Link>
            </li>
            <li>
              <Link href="/lien-he" className={linkCls}>
                {tn("contact")}
              </Link>
            </li>
          </ul>
          <h2 className="mt-8 font-mono text-xs tracking-[0.2em] text-orange-300 uppercase">{t("policies")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {policies.map((p) => (
              <li key={p.id}>
                <Link
                  href={{ pathname: "/chinh-sach/[policySlug]", params: { policySlug: p.slug[locale] } }}
                  className={linkCls}
                >
                  {p.title[locale]}
                </Link>
              </li>
            ))}
            <li>
              <CookieSettingsButton label={t("cookieSettings")} />
            </li>
          </ul>
        </nav>
      </div>

      <div className="container-page mt-14 flex flex-col gap-2 border-t border-charcoal-800 pt-6 text-xs text-charcoal-300 md:flex-row md:justify-between">
        <p>{t("rights", { year, legalName: site.legalName })}</p>
        <p>
          {t("taxId")} <span className="font-mono">{site.taxId}</span> · {t("registered")}: {site.registeredAddress}
        </p>
      </div>
    </footer>
  );
}
