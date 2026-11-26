import type { MetadataRoute } from "next";
import { getRepositories } from "@/data";
import { routing, type AppLocale } from "@/i18n/routing";
import { localizedUrl } from "@/shared/lib/seo";

type Href = Parameters<typeof localizedUrl>[0];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repos = await getRepositories();
  const [destinations, services, policies, pricingMeta] = await Promise.all([
    repos.destinations.list(),
    repos.services.list(),
    repos.content.policies(),
    repos.pricing.meta(),
  ]);
  const lastModified = new Date(pricingMeta.updatedAt);

  const entry = (hrefFor: (l: AppLocale) => Href, priority: number): MetadataRoute.Sitemap[number] => ({
    url: localizedUrl(hrefFor("vi"), "vi"),
    lastModified,
    priority,
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(hrefFor(l), l)])) },
  });

  const staticPaths: [Href, number][] = [
    ["/", 1],
    ["/bang-gia", 0.9],
    ["/bao-gia", 0.9],
    ["/tuyen", 0.8],
    ["/dich-vu", 0.7],
    ["/tra-cuu", 0.7],
    ["/hang-cam-gui", 0.6],
    ["/cong-cu/trong-luong-quy-doi", 0.5],
    ["/quy-trinh-gui-hang", 0.5],
    ["/ve-chung-toi", 0.6],
    ["/lien-he", 0.7],
  ];

  return [
    ...staticPaths.map(([href, p]) => entry(() => href, p)),
    ...destinations.map((d) => entry((l) => ({ pathname: "/[routeSlug]", params: { routeSlug: d.slug[l] } }), 0.9)),
    ...services.map((s) =>
      entry((l) => ({ pathname: "/dich-vu/[serviceSlug]", params: { serviceSlug: s.slug[l] } }), 0.7),
    ),
    // Chính sách còn là bản nháp (demo) thì không đưa vào sitemap
    ...policies
      .filter((p) => !p.demo)
      .map((p) => entry((l) => ({ pathname: "/chinh-sach/[policySlug]", params: { policySlug: p.slug[l] } }), 0.3)),
  ];
}
