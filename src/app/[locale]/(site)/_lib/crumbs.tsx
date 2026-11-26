import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { Breadcrumbs, JsonLd } from "@/shared/ui";
import { breadcrumbSchema, localizedUrl } from "@/shared/lib/seo";

type Href = Parameters<typeof Link>[0]["href"];

/** Breadcrumb hiển thị + JSON-LD BreadcrumbList. */
export function PageCrumbs({
  locale,
  homeLabel,
  items,
}: {
  locale: AppLocale;
  homeLabel: string;
  items: { label: string; href: Href }[];
}) {
  const all = [{ label: homeLabel, href: "/" as Href }, ...items];
  return (
    <>
      <JsonLd
        data={breadcrumbSchema(all.map((c) => ({ name: c.label, url: localizedUrl(c.href as never, locale) })))}
      />
      <Breadcrumbs
        inverse
        items={all.map((c, i) => ({ label: c.label, href: String(i) }))}
        renderLink={(idx: string, children: ReactNode) => (
          <Link href={all[Number(idx)]!.href} className="hover:text-orange-300">
            {children}
          </Link>
        )}
      />
    </>
  );
}
