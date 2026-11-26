import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { getRepositories } from "@/data";
import { DemoNotice, PageHeader, Section } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { PageCrumbs } from "../../_lib/crumbs";

type Props = { params: Promise<{ locale: AppLocale; policySlug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const list = await (await getRepositories()).content.policies();
  return routing.locales.flatMap((locale) => list.map((p) => ({ locale, policySlug: p.slug[locale] })));
}

async function load(locale: AppLocale, slug: string) {
  const p = await (await getRepositories()).content.policyBySlug(decodeURIComponent(slug), locale);
  if (!p) notFound();
  return p;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, policySlug } = await params;
  const p = await load(locale, policySlug);
  return buildMetadata({
    locale,
    title: p.title[locale],
    description: p.sections[0]?.body[0]?.[locale].slice(0, 160) ?? p.title[locale],
    hrefByLocale: {
      vi: { pathname: "/chinh-sach/[policySlug]", params: { policySlug: p.slug.vi } },
      en: { pathname: "/chinh-sach/[policySlug]", params: { policySlug: p.slug.en } },
    },
    // Bản nháp chưa được duyệt → không cho index
    noindex: p.demo,
  });
}

export default async function PolicyPage({ params }: Props) {
  const { locale, policySlug } = await params;
  setRequestLocale(locale);
  const p = await load(locale, policySlug);
  const t = await getTranslations();
  return (
    <>
      <PageHeader
        eyebrow={t("footer.policies")}
        title={p.title[locale]}
        breadcrumbs={
          <PageCrumbs
            locale={locale}
            homeLabel={t("common.breadcrumbHome")}
            items={[
              {
                label: p.title[locale],
                href: { pathname: "/chinh-sach/[policySlug]", params: { policySlug: p.slug[locale] } },
              },
            ]}
          />
        }
      />
      <Section>
        <article className="max-w-3xl">
          {p.demo && <DemoNotice className="mb-8">{t("pages.policy.draft")}</DemoNotice>}
          {p.sections.map((s) => (
            <section key={s.heading.en} className="mb-10">
              <h2 className="font-display text-display-md font-bold uppercase">{s.heading[locale]}</h2>
              {s.body.map((b) => (
                <p key={b.en} className="mt-3 text-lg">
                  {b[locale]}
                </p>
              ))}
            </section>
          ))}
        </article>
      </Section>
    </>
  );
}
