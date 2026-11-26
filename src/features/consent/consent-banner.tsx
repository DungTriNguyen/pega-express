"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { publicEnv } from "@/shared/config/public-env";
import { setConsent, useConsent } from "./consent-store";

/** Chỉ hiện khi CÓ bật GA4 hoặc Meta Pixel (Cloudflare Web Analytics không dùng cookie). Không chặn màn hình. */
export function ConsentBanner({ policySlug }: { policySlug: string }) {
  const t = useTranslations("consent");
  const consent = useConsent();
  const needed = Boolean(publicEnv.ga4Id || publicEnv.metaPixelId);
  if (!needed || consent !== "unknown") return null;
  return (
    <div
      role="region"
      aria-label={t("title")}
      className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-xl border-2 border-charcoal-900 bg-label p-4 text-label-ink shadow-2 md:bottom-4 dark:border-charcoal-300/40"
    >
      <p className="text-sm">
        {t("body")}{" "}
        <Link href={{ pathname: "/chinh-sach/[policySlug]", params: { policySlug } }} className="underline">
          {t("policy")}
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setConsent("granted")}
          className="min-h-11 rounded-md bg-btn px-4 text-sm font-semibold text-on-btn"
        >
          {t("accept")}
        </button>
        <button
          type="button"
          onClick={() => setConsent("denied")}
          className="min-h-11 rounded-md border border-border-strong px-4 text-sm font-semibold"
        >
          {t("reject")}
        </button>
      </div>
    </div>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => setConsent("unknown")} className="text-left hover:text-orange-300">
      {label}
    </button>
  );
}
