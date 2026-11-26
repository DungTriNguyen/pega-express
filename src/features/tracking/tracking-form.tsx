"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, MessageCircle, Search } from "lucide-react";
import { Button, FieldError, Input, Label, buttonClass } from "@/shared/ui";
import { track } from "@/features/analytics";
import { redirectTrackingProvider, type TrackingProvider, type TrackingResult } from "./provider";

export function TrackingForm({
  zaloUrl,
  provider = redirectTrackingProvider,
  showTimeline = false,
}: {
  zaloUrl: string;
  provider?: TrackingProvider;
  showTimeline?: boolean;
}) {
  const t = useTranslations("tracking");
  const tc = useTranslations("common");
  const locale = useLocale() as "vi" | "en";
  const uid = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<TrackingResult>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    setResult(undefined);
    if (!trimmed) return setError(t("errorEmpty"));
    if (trimmed.replace(/[\s-]/g, "").length < 8) return setError(t("errorShort"));
    setError(undefined);
    setPending(true);
    try {
      const r = await provider.track(trimmed, locale);
      setResult(r);
      track("track_search", { carrier: r.kind === "redirect" ? r.options.map((o) => o.carrier).join(",") : "none" });
    } finally {
      setPending(false);
    }
  }

  const inputId = `${uid}-code`;
  const errId = `${uid}-err`;

  return (
    <div>
      <form onSubmit={onSubmit} noValidate className="space-y-3">
        <Label htmlFor={inputId}>{t("label")}</Label>
        <div className="flex gap-2">
          <Input
            id={inputId}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("placeholder")}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="font-mono tracking-widest"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errId : undefined}
          />
          <Button
            type="submit"
            disabled={pending}
            aria-label={t("submit")}
            icon={<Search aria-hidden className="size-4" />}
          >
            <span className="hidden sm:inline">{t("submit")}</span>
          </Button>
        </div>
        <FieldError id={errId}>{error}</FieldError>
      </form>

      <div aria-live="polite" className="mt-4 space-y-3">
        {pending && <p className="text-sm text-muted">{tc("loading")}</p>}
        {result?.kind === "redirect" && (
          <>
            <p className="text-sm text-muted">
              {result.options.length === 1 ? t("detected", { carrier: result.options[0]!.name }) : t("chooseCarrier")}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.options.map((o) => (
                <a
                  key={o.carrier}
                  href={o.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass("primary", "md")}
                >
                  {t("openOfficial", { carrier: o.name })}
                  <ExternalLink aria-hidden className="size-4" />
                  <span className="sr-only">{tc("openInNewTab")}</span>
                </a>
              ))}
            </div>
          </>
        )}
        {result && result.kind !== "events" && (
          <div>
            {result.kind === "unrecognized" && <p className="mb-2 text-sm text-muted">{t("notRecognized")}</p>}
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("zalo_click", { location: "tracking" })}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-strong underline-offset-4 hover:underline"
            >
              <MessageCircle aria-hidden className="size-4" />
              {t("askZalo")}
            </a>
          </div>
        )}
      </div>

      {showTimeline && (
        <div className="mt-10">
          <h2 className="font-sub text-lg font-semibold">{t("timelineTitle")}</h2>
          <ol className="mt-4 space-y-0 border-l-2 border-border-strong pl-6">
            {(["1", "2", "3", "4", "5"] as const).map((k) => (
              <li key={k} className="relative pb-5 last:pb-0">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-[1.95rem] size-3 rounded-full border-2 border-brand bg-bg"
                />
                <span className="font-mono text-xs text-muted">0{k}</span>
                <p className="font-medium">{t(`timeline.${k}`)}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted">{t("timelineNote")}</p>
        </div>
      )}
    </div>
  );
}
