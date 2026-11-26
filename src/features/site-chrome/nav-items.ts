import type { StaticPathname } from "@/i18n/routing";

export const NAV_ITEMS: {
  key: "services" | "destinations" | "pricing" | "tracking" | "contact";
  href: StaticPathname;
}[] = [
  { key: "services", href: "/dich-vu" },
  { key: "destinations", href: "/tuyen" },
  { key: "pricing", href: "/bang-gia" },
  { key: "tracking", href: "/tra-cuu" },
  { key: "contact", href: "/lien-he" },
];
