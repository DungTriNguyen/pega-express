import { Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo, buttonClass } from "@/shared/ui";
import { site } from "@/shared/config/site";
import { ThemeToggle } from "@/features/theme-toggle";
import { LocaleSwitcher } from "@/features/locale-switcher";
import { TrackedAnchor } from "@/features/analytics";
import { MobileNav } from "./mobile-nav";
import { NAV_ITEMS } from "./nav-items";

export async function Header() {
  const t = await getTranslations("nav");
  const tc = await getTranslations("common");
  const items = NAV_ITEMS.map((i) => ({ href: i.href, label: t(i.key) }));
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md supports-[backdrop-filter]:bg-bg/75">
      <div className="container-page flex h-[var(--header-h)] items-center gap-4">
        <Link href="/" className="shrink-0" aria-label={`Pega Express — ${tc("brandTagline")}`}>
          <Logo priority className="h-8 sm:h-10 lg:h-11" alt="" />
        </Link>
        <nav aria-label={t("main")} className="ml-4 hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  className="inline-flex min-h-11 items-center rounded-md px-3 font-sub text-[0.95rem] font-semibold text-fg transition-colors hover:text-brand-strong"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <TrackedAnchor
            event="call_click"
            data-location="header"
            href={`tel:${site.phone.e164}`}
            className="hidden min-h-11 items-center gap-2 px-2 font-mono text-sm font-semibold tracking-wide text-fg hover:text-brand-strong xl:inline-flex"
          >
            <Phone aria-hidden className="size-4 text-brand-strong" />
            {site.phone.display}
          </TrackedAnchor>
          <LocaleSwitcher />
          <ThemeToggle />
          <Link href="/bao-gia" className={buttonClass("primary", "md", "ml-2 hidden sm:inline-flex")}>
            {tc("getQuote")}
          </Link>
          <MobileNav
            items={items}
            labels={{ open: t("openMenu"), close: t("closeMenu"), menu: t("menu") }}
            phone={site.phone}
          />
        </div>
      </div>
    </header>
  );
}
