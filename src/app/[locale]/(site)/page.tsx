import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Globe, MessageCircle, Package, Phone, Snowflake, Truck, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getRepositories } from "@/data";
import { site, zaloUrl } from "@/shared/config/site";
import { Section, FaqList, JsonLd, buttonClass, DemoNotice } from "@/shared/ui";
import { Hero, TrustBar, ProcessSteps, CapabilityGallery, FinalCta } from "@/shared/sections";
import { buildMetadata, faqSchema } from "@/shared/lib/seo";
import { DeparturesBoard, FrozenRoutes, RouteMap } from "@/features/destinations";
import { HeroCard } from "@/features/hero-card";
import { QuoteCalculator } from "@/features/quote";
import { TrackingForm } from "@/features/tracking";
import { TestimonialsCarousel } from "@/features/testimonials";
import { TrackedAnchor } from "@/features/analytics";
import { loadImages, loadQuoteData } from "./_lib/page-data";

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.home" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    hrefByLocale: { vi: "/", en: "/" },
    absoluteTitle: true,
  });
}

const serviceIcons = { globe: Globe, zap: Zap, package: Package, truck: Truck, snowflake: Snowflake } as const;

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const repos = await getRepositories();
  const [{ pricing, quoteDestinations, boardRows, destinations }, images, services, faq, testimonials] =
    await Promise.all([
      loadQuoteData(locale),
      loadImages(locale),
      repos.services.list(),
      repos.content.faq(),
      repos.testimonials.list(),
    ]);
  const zalo = zaloUrl();
  const heroImage = images.find((i) => i.id === "banner-2") ?? images[0]!;
  const faqItems = faq.map((f) => ({ id: f.id, q: f.q[locale], a: f.a[locale] }));

  return (
    <>
      <JsonLd data={faqSchema(faqItems)} />
      <Hero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        // caption={t("hero.photoCaption")}
        image={heroImage}
        routeMap={<RouteMap destinations={destinations} className="h-[22rem] w-full sm:h-[28rem] lg:h-[34rem]" />}
        actions={
          <>
            <Link href="/bang-gia" className={buttonClass("primary", "lg")}>
              {t("hero.primaryCta")} <ArrowRight aria-hidden className="size-4" />
            </Link>
            <TrackedAnchor
              event="zalo_click"
              data-location="hero"
              href={zalo}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("outline-inverse", "lg")}
            >
              <MessageCircle aria-hidden className="size-4" /> {t("hero.secondaryCta")}
            </TrackedAnchor>
          </>
        }
        card={<HeroCard destinations={quoteDestinations} pricing={pricing} zaloUrl={zalo} />}
      />

      <TrustBar
        title={t("trust.title")}
        items={[
          // { label: t("trust.taxId", { taxId: site.taxId }), note: t("trust.taxIdNote") },
          { value: 1, strong: t("trust.airport"), label: "", note: t("trust.airportNote") },
          // { value: destinations.length, strong: t("trust.routes"), label: "", note: t("trust.routesNote") },
          { value: 200, strong: t("trust.routes"), label: "", note: t("trust.routesNote") },
          { value: site.domesticCities.length, strong: t("trust.domestic"), label: "", note: t("trust.domesticNote") },
        ]}
      />

      <Section
        id="tuyen"
        eyebrow={t("routes.eyebrow")}
        title={t("routes.title")}
        subtitle={t("routes.subtitle")}
        actions={
          <Link href="/tuyen" className={buttonClass("secondary", "md")}>
            {t("routes.allRoutes")} <ArrowRight aria-hidden className="size-4" />
          </Link>
        }
      >
        <DeparturesBoard rows={boardRows} locale={locale} demo={pricing.demo} />
      </Section>

      <Section
        id="dong-lanh"
        tone="alt"
        eyebrow={t("frozen.eyebrow")}
        title={t("frozen.title")}
        subtitle={t("frozen.subtitle")}
        actions={
          <Link href="/bao-gia" className={buttonClass("secondary", "md")}>
            {t("frozen.cta")} <ArrowRight aria-hidden className="size-4" />
          </Link>
        }
      >
        <FrozenRoutes pricing={pricing} destinations={destinations} locale={locale} />
      </Section>

      <Section
        id="dich-vu"
        eyebrow={t("services.eyebrow")}
        title={t("services.title")}
        subtitle={t("services.subtitle")}
      >
        <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => {
            const Icon = serviceIcons[s.icon];
            return (
              <li key={s.id} className="reveal bg-surface">
                <Link
                  href={{ pathname: "/dich-vu/[serviceSlug]", params: { serviceSlug: s.slug[locale] } }}
                  className="group flex h-full flex-col p-7 transition-colors hover:bg-surface-2"
                >
                  <Icon aria-hidden className="size-7 text-brand-strong" />
                  <h3 className="mt-6 font-display text-2xl font-bold uppercase">{s.name[locale]}</h3>
                  <p className="mt-3 text-muted">{s.short[locale]}</p>
                  <span className="mt-auto pt-6 font-sub text-sm font-semibold text-brand-strong">
                    {t("common.learnMore")}{" "}
                    <ArrowRight aria-hidden className="inline size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section id="quy-trinh" tone="inverse" eyebrow={t("process.eyebrow")} title={t("process.title")}>
        <ProcessSteps
          steps={(["1", "2", "3", "4"] as const).map((k) => ({
            title: t(`process.steps.${k}.title`),
            body: t(`process.steps.${k}.body`),
          }))}
        />
      </Section>

      <Section
        id="nang-luc"
        tone="inverse"
        eyebrow={t("capability.eyebrow")}
        title={t("capability.title")}
        subtitle={t("capability.subtitle")}
        className="border-t border-charcoal-800"
      >
        <CapabilityGallery
          images={images}
          labels={{
            real: t("capability.realBadge"),
            illustration: t("capability.illustrationBadge"),
            prev: t("capability.prev"),
            next: t("capability.next"),
          }}
        />
      </Section>

      <Section id="vi-sao" eyebrow={t("why.eyebrow")} title={t("why.title")}>
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {(["speed", "trust", "connect", "breakthrough", "together"] as const).map((k, i) => (
            <li key={k} className="reveal border-t-2 border-fg pt-5">
              <span className="font-mono text-xs text-brand-strong">0{i + 1}</span>
              <h3 className="mt-2 font-display text-2xl font-bold uppercase">{t(`why.items.${k}.title`)}</h3>
              <p className="mt-2 text-sm text-muted">{t(`why.items.${k}.body`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="cong-cu" tone="alt" eyebrow={t("quickTools.eyebrow")} title={t("quickTools.title")}>
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="border border-border bg-surface p-6 sm:p-8">
            <h3 className="mb-5 font-sub text-lg font-semibold">{t("heroCard.tabQuote")}</h3>
            <QuoteCalculator destinations={quoteDestinations} pricing={pricing} />
          </div>
          <div className="border border-border bg-surface p-6 sm:p-8">
            <h3 className="mb-5 font-sub text-lg font-semibold">{t("tracking.title")}</h3>
            <TrackingForm zaloUrl={zalo} />
          </div>
        </div>
      </Section>

      {testimonials.length > 0 && (
        <Section id="cam-nhan" eyebrow={t("testimonials.eyebrow")} title={t("testimonials.title")}>
          {/* {testimonials.some((x) => x.demo) && (
            <DemoNotice className="mb-6">{t("testimonials.placeholderNotice")}</DemoNotice>
          )} */}
          <TestimonialsCarousel
            items={testimonials.map((x) => ({
              id: x.id,
              author: x.author,
              destination: x.destination[locale],
              rating: x.rating,
              text: x.text[locale],
              source: x.source,
              demo: x.demo,
            }))}
          />
        </Section>
      )}

      <Section id="faq" tone="alt" eyebrow={t("faq.eyebrow")} title={t("faq.title")}>
        <FaqList items={faqItems} />
      </Section>

      <FinalCta
        title={t("finalCta.title")}
        subtitle={t("finalCta.subtitle")}
        actions={
          <>
            <Link href="/bao-gia" className={buttonClass("primary", "lg")}>
              {t("finalCta.primary")} <ArrowRight aria-hidden className="size-4" />
            </Link>
            <TrackedAnchor
              event="call_click"
              data-location="final_cta"
              href={`tel:${site.phone.e164}`}
              className={buttonClass("outline-inverse", "lg")}
            >
              <Phone aria-hidden className="size-4" /> {t("finalCta.secondary", { phone: site.phone.display })}
            </TrackedAnchor>
          </>
        }
      />
    </>
  );
}
