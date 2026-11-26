import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section, buttonClass } from "@/shared/ui";

export default async function NotFound() {
  const t = await getTranslations();
  const links = [
    { href: "/bang-gia" as const, label: t("nav.pricing") },
    { href: "/bao-gia" as const, label: t("nav.quote") },
    { href: "/tra-cuu" as const, label: t("nav.tracking") },
    { href: "/lien-he" as const, label: t("nav.contact") },
  ];
  return (
    <Section>
      <div className="max-w-2xl py-10">
        <p className="font-mono text-sm tracking-[0.3em] text-brand-strong">SGN ✈ ???</p>
        <h1 className="mt-3 font-display text-display-xl font-extrabold uppercase">{t("pages.notFound.h1")}</h1>
        <p className="mt-4 text-lg text-muted">{t("pages.notFound.body")}</p>
        <ul className="mt-8 flex flex-wrap gap-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={buttonClass("secondary", "md")}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/" className={buttonClass("primary", "lg", "mt-6")}>
          {t("pages.notFound.home")}
        </Link>
      </div>
    </Section>
  );
}
