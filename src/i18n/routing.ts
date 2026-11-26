import { defineRouting } from "next-intl/routing";

/**
 * vi mặc định ở "/", en ở "/en". Slug được dịch theo ngôn ngữ.
 * Thêm ngôn ngữ: thêm vào `locales` + file messages/<lang>.json + bản dịch slug bên dưới (xem docs/i18n.md).
 */
export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "as-needed",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/dich-vu": { vi: "/dich-vu", en: "/services" },
    "/dich-vu/[serviceSlug]": { vi: "/dich-vu/[serviceSlug]", en: "/services/[serviceSlug]" },
    "/tuyen": { vi: "/tuyen", en: "/destinations" },
    "/[routeSlug]": "/[routeSlug]",
    "/bang-gia": { vi: "/bang-gia", en: "/pricing" },
    "/bao-gia": { vi: "/bao-gia", en: "/quote" },
    "/tra-cuu": { vi: "/tra-cuu", en: "/tracking" },
    "/hang-cam-gui": { vi: "/hang-cam-gui", en: "/prohibited-items" },
    "/cong-cu/trong-luong-quy-doi": { vi: "/cong-cu/trong-luong-quy-doi", en: "/tools/volumetric-weight" },
    "/quy-trinh-gui-hang": { vi: "/quy-trinh-gui-hang", en: "/how-it-works" },
    "/ve-chung-toi": { vi: "/ve-chung-toi", en: "/about" },
    "/lien-he": { vi: "/lien-he", en: "/contact" },
    "/chinh-sach/[policySlug]": { vi: "/chinh-sach/[policySlug]", en: "/policies/[policySlug]" },
    "/cam-on": { vi: "/cam-on", en: "/thank-you" },
  },
});

export type AppLocale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;

/** Các đường dẫn tĩnh (không có tham số động) — dùng cho menu */
export type StaticPathname = Exclude<AppPathname, `${string}[${string}`>;
