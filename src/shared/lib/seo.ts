import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { site } from "@/shared/config/site";
import { absoluteUrl } from "./utils";

type Href = Parameters<typeof getPathname>[0]["href"];

/** URL tuyệt đối theo locale cho một href (đã dịch slug). */
export function localizedUrl(href: Href, locale: AppLocale) {
  return absoluteUrl(getPathname({ href, locale }));
}

/**
 * Metadata chuẩn cho mọi trang: title, description, canonical, hreflang vi/en/x-default, OG, Twitter.
 * `hrefByLocale` cho phép trang động truyền slug riêng từng ngôn ngữ.
 */
export function buildMetadata({
  locale,
  title,
  description,
  hrefByLocale,
  noindex = false,
  absoluteTitle = false,
}: {
  locale: AppLocale;
  title: string;
  description: string;
  hrefByLocale: Record<AppLocale, Href>;
  noindex?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const canonical = localizedUrl(hrefByLocale[locale], locale);
  const languages = Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(hrefByLocale[l], l)]));
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: { ...languages, "x-default": localizedUrl(hrefByLocale.vi, "vi") },
    },
    openGraph: {
      type: "website",
      siteName: site.brand,
      title,
      description,
      url: canonical,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      images: [{ url: absoluteUrl("/brand/og-default.png"), width: 1200, height: 630, alt: site.brand }],
    },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl("/brand/og-default.png")] },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

/** schema.org: Organization + LocalBusiness (địa chỉ vận hành) — plan mục 4.11/4.12. */
export function organizationSchema(locale: AppLocale) {
  const orgId = absoluteUrl("/#organization");
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": orgId,
      name: site.brand,
      legalName: site.legalName,
      alternateName: site.internationalName,
      taxID: site.taxId,
      foundingDate: site.foundingDate,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/brand/icon-512.png"),
      email: site.email,
      telephone: site.phone.e164,
      sameAs: [site.social.facebook, site.social.tiktok],
      description:
        locale === "vi"
          ? "Pega Express là công ty chuyển phát và gửi hàng quốc tế tại TP.HCM, không liên quan tới Pegasystems hay xe điện PEGA."
          : "Pega Express is a courier and international shipping company in Ho Chi Minh City, unrelated to Pegasystems or PEGA e-bikes.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Phòng 702A, Tầng 7, Tòa nhà Centre Point, 106 Nguyễn Văn Trỗi",
        addressLocality: "Phường Phú Nhuận, TP. Hồ Chí Minh",
        addressCountry: "VN",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "ProfessionalService"],
      "@id": absoluteUrl("/#localbusiness"),
      name: `${site.brand} — ${locale === "vi" ? "Gửi hàng quốc tế & hỏa tốc" : "International & express shipping"}`,
      parentOrganization: { "@id": orgId },
      image: absoluteUrl("/media/kho-san-bay-toan-canh-1280.webp"),
      telephone: site.phone.e164,
      email: site.email,
      url: absoluteUrl(locale === "vi" ? "/" : "/en"),
      address: {
        "@type": "PostalAddress",
        streetAddress: site.operatingAddress.street,
        addressLocality: `${site.operatingAddress.ward}, ${site.operatingAddress.city}`,
        addressCountry: "VN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: site.operatingAddress.geo.lat,
        longitude: site.operatingAddress.geo.lng,
      },
      // TODO(owner): thêm openingHoursSpecification khi xác nhận làm Thứ 7/CN hay không (plan mục 1 ❓).
      // Giờ 8:00–17:30 đã hiển thị trên trang; chưa đưa vào schema để tránh khai sai ngày làm việc.
      areaServed: ["VN", "US", "CA", "AU", "JP", "KR", "TW", "CN", "MY", "SG"],
      priceRange: "$$",
    },
  ];
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function serviceSchema(name: string, description: string, url: string, areaServed?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: { "@id": absoluteUrl("/#organization") },
    ...(areaServed ? { areaServed } : {}),
  };
}
