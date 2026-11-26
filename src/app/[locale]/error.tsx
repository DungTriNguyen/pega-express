"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { site } from "@/shared/config/site";
import { Button, buttonClass } from "@/shared/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations();
  useEffect(() => {
    console.error(error.digest ?? error.message);
  }, [error]);
  return (
    <section className="container-page py-24">
      <h1 className="font-display text-display-lg font-extrabold uppercase">{t("pages.error.title")}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{t("pages.error.body")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>{t("common.retry")}</Button>
        <a href={`tel:${site.phone.e164}`} className={buttonClass("secondary")}>
          {site.phone.display}
        </a>
      </div>
    </section>
  );
}
