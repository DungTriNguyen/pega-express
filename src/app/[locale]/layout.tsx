import type { Metadata, Viewport } from "next";
import { ViewTransition, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { Be_Vietnam_Pro, JetBrains_Mono, Saira, Saira_Condensed } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { getRepositories } from "@/data";
import { site, zaloUrl } from "@/shared/config/site";
import { JsonLd } from "@/shared/ui";
import { organizationSchema } from "@/shared/lib/seo";
import { absoluteUrl } from "@/shared/lib/utils";
import { ThemeProvider } from "@/features/theme-toggle";
import { SlugAlternatesProvider, buildAlternates } from "@/features/locale-switcher";
import { Footer, Header, MobileCtaBar } from "@/features/site-chrome";
import { Analytics } from "@/features/analytics";
import { ConsentBanner } from "@/features/consent";

// Font tự host qua next/font (tải lúc build, không gọi Google lúc chạy), subset latin + vietnamese
const display = Saira_Condensed({
  subsets: ["latin", "vietnamese"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-display-family",
  preload: true,
});
const sub = Saira({
  subsets: ["latin", "vietnamese"],
  weight: ["600"],
  display: "swap",
  variable: "--font-sub-family",
  preload: false,
});
const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-body",
});
const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-mono-family",
  preload: false,
});

// Chỉ chấp nhận locale đã khai báo — /favicon.ico, /abc… trả 404 trước khi render trang
export const dynamicParams = false;
// Toàn bộ trang nội dung là tĩnh (build sẵn) — Worker chỉ đọc từ cache, không render lại (ADR-007)
export const dynamic = "force-static";
export const revalidate = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.home" });
  return {
    metadataBase: new URL(absoluteUrl("/")),
    title: { default: t("title"), template: `%s | ${site.brand}` },
    description: t("description"),
    applicationName: site.brand,
    icons: {
      icon: [
        { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: "/brand/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    // eslint-disable-next-line no-restricted-syntax -- meta theme-color cần mã màu tĩnh (= token ivory-50)
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    // eslint-disable-next-line no-restricted-syntax -- như trên (= token charcoal-900)
    { media: "(prefers-color-scheme: dark)", color: "#142129" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as AppLocale;

  const repos = await getRepositories();
  const [destinations, services, policies] = await Promise.all([
    repos.destinations.list(),
    repos.services.list(),
    repos.content.policies(),
  ]);
  const t = await getTranslations("common");
  const tm = await getTranslations("mobileBar");
  const cookiePolicy = policies.find((p) => p.id === "cookies");

  return (
    <html
      lang={l}
      suppressHydrationWarning
      className={`${display.variable} ${sub.variable} ${body.variable} ${mono.variable}`}
    >
      {/* suppressHydrationWarning: extension trình duyệt (vd. ColorZilla) chèn thuộc tính vào <body> */}
      <body className="min-h-dvh" suppressHydrationWarning>
        <JsonLd data={organizationSchema(l)} />
        <NextIntlClientProvider>
          <ThemeProvider>
            <SlugAlternatesProvider
              value={{
                routeSlug: buildAlternates(destinations),
                serviceSlug: buildAlternates(services),
                policySlug: buildAlternates(policies),
              }}
            >
              <a
                href="#main"
                className="sr-only z-50 bg-btn px-4 py-3 text-on-btn focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
              >
                {t("skipToContent")}
              </a>
              <Header />
              <main id="main" tabIndex={-1} className="outline-none">
                <ViewTransition>{children}</ViewTransition>
              </main>
              <Footer locale={l} services={services} policies={policies} />
              <MobileCtaBar
                zaloUrl={zaloUrl()}
                phoneE164={site.phone.e164}
                labels={{ bar: tm("label"), zalo: tm("zalo"), call: tm("call"), quote: tm("quote") }}
              />
              {cookiePolicy && <ConsentBanner policySlug={cookiePolicy.slug[l]} />}
              <Analytics />
            </SlugAlternatesProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
