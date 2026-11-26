"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Phone, MessageCircle } from "lucide-react";
import { goodsTypes, leadSchema, type LeadInput, type Lead } from "@/domain/schemas";
import { Link, useRouter } from "@/i18n/navigation";
import { Button, FieldError, Input, Label, Select, Textarea, buttonClass } from "@/shared/ui";
import { publicEnv } from "@/shared/config/public-env";
import { readQuoteDraft } from "@/shared/lib/quote-draft";
import { track } from "@/features/analytics";
import { Turnstile } from "./turnstile";

type Props = {
  destinations: { id: string; name: string }[];
  privacySlug: string;
  zaloUrl: string;
  phoneHref: string;
  phoneDisplay: string;
  defaultDestination?: string;
};

export function LeadForm({ destinations, privacySlug, zaloUrl, phoneHref, phoneDisplay, defaultDestination }: Props) {
  const t = useTranslations("lead");
  const tq = useTranslations("quote");
  const tc = useTranslations("common");
  const locale = useLocale() as "vi" | "en";
  const router = useRouter();
  const uid = useId();
  const [serverError, setServerError] = useState<string>();
  const [resetSignal, setResetSignal] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput, unknown, Lead>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      service: "international",
      destination: defaultDestination ?? "",
      locale,
      consent: false as unknown as true,
      turnstileToken: "",
      company: "",
    },
  });

  useEffect(() => {
    const draft = readQuoteDraft();
    if (!draft) return;
    if (draft.destination) setValue("destination", draft.destination);
    if (draft.weightKg) setValue("weightKg", draft.weightKg);
    if (draft.dimensions) setValue("dimensions", draft.dimensions);
    if (draft.goodsType) setValue("goodsType", draft.goodsType);
  }, [setValue]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const utm = ["utm_source", "utm_medium", "utm_campaign"]
      .map((k) => p.get(k))
      .filter(Boolean)
      .join("|");
    setValue("sourcePage", window.location.pathname);
    if (utm) setValue("utm", utm);
  }, [setValue]);

  const onSubmit = async (data: Lead) => {
    setServerError(undefined);
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setServerError(t("errors.offline"));
      return;
    }
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        track("quote_submit", { destination: data.destination, service: data.service });
        router.push("/cam-on");
        return;
      }
      setServerError(
        json.error === "rate_limited"
          ? t("errors.rate_limited")
          : json.error === "captcha"
            ? t("errors.captcha_required")
            : t("errors.generic"),
      );
    } catch {
      setServerError(t("errors.offline"));
    }
    setValue("turnstileToken", "");
    setResetSignal((n) => n + 1);
  };

  const err = (key: keyof LeadInput) => {
    const msg = errors[key]?.message;
    return msg ? t(`errors.${msg}` as "errors.generic") : undefined;
  };
  const id = (k: string) => `${uid}-${k}`;
  const described = (k: keyof LeadInput) => (errors[k] ? `${id(k)}-err` : undefined);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5" id="lead-form-el">
      {/* honeypot */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("company")}>Company</label>
        <input id={id("company")} tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor={id("name")}>{t("name")}</Label>
          <Input
            id={id("name")}
            autoComplete="name"
            aria-invalid={!!errors.name || undefined}
            aria-describedby={described("name")}
            {...register("name")}
          />
          <FieldError id={`${id("name")}-err`}>{err("name")}</FieldError>
        </div>
        <div>
          <Label htmlFor={id("phone")}>{t("phone")}</Label>
          <Input
            id={id("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone || undefined}
            aria-describedby={described("phone")}
            {...register("phone")}
          />
          <FieldError id={`${id("phone")}-err`}>{err("phone")}</FieldError>
        </div>
        <div>
          <Label htmlFor={id("email")} hint={tc("optional")}>
            {t("email")}
          </Label>
          <Input
            id={id("email")}
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email || undefined}
            aria-describedby={described("email")}
            {...register("email")}
          />
          <FieldError id={`${id("email")}-err`}>{err("email")}</FieldError>
        </div>
        <div>
          <Label htmlFor={id("service")}>{t("service")}</Label>
          <Select id={id("service")} {...register("service")}>
            {(["international", "domestic", "packing", "other"] as const).map((s) => (
              <option key={s} value={s}>
                {t(`serviceOptions.${s}`)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={id("destination")} hint={tc("optional")}>
            {t("destination")}
          </Label>
          <Select id={id("destination")} {...register("destination")}>
            <option value="">—</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={id("goodsType")} hint={tc("optional")}>
            {t("goodsType")}
          </Label>
          <Select id={id("goodsType")} {...register("goodsType", { setValueAs: (v) => (v === "" ? undefined : v) })}>
            <option value="">—</option>
            {goodsTypes.map((g) => (
              <option key={g} value={g}>
                {tq(`goods.${g}`)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={id("weight")} hint={tc("optional")}>
            {t("weight")}
          </Label>
          <Input
            id={id("weight")}
            inputMode="decimal"
            {...register("weightKg", {
              setValueAs: (v) => (v === "" || v === undefined ? undefined : Number(String(v).replace(",", "."))),
            })}
          />
        </div>
        <div>
          <Label htmlFor={id("dims")} hint={tc("optional")}>
            {t("dimensions")}
          </Label>
          <Input id={id("dims")} placeholder="40x30x30" {...register("dimensions")} />
        </div>
      </div>

      <div>
        <Label htmlFor={id("note")} hint={tc("optional")}>
          {t("note")}
        </Label>
        <Textarea id={id("note")} rows={3} placeholder={t("notePlaceholder")} {...register("note")} />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-5 shrink-0 accent-[var(--button-primary-bg)]"
            aria-invalid={!!errors.consent || undefined}
            aria-describedby={described("consent")}
            {...register("consent")}
          />
          <span>
            {t("consent")}{" "}
            <Link
              href={{ pathname: "/chinh-sach/[policySlug]", params: { policySlug: privacySlug } }}
              className="font-medium underline"
            >
              {t("consentLink")}
            </Link>
            .
          </span>
        </label>
        <FieldError id={`${id("consent")}-err`}>{err("consent")}</FieldError>
      </div>

      <div>
        <p className="sr-only">{t("captchaLabel")}</p>
        <Turnstile
          siteKey={publicEnv.turnstileSiteKey}
          language={locale}
          resetSignal={resetSignal}
          onToken={(token) => setValue("turnstileToken", token, { shouldValidate: !!token })}
        />
        <FieldError id={`${id("turnstileToken")}-err`}>{err("turnstileToken")}</FieldError>
      </div>

      <input type="hidden" {...register("locale")} />

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>

      {serverError && (
        <div role="alert" className="space-y-3 border-l-4 border-danger bg-danger/10 p-4">
          <p className="text-sm">{serverError}</p>
          <div className="flex flex-wrap gap-2">
            <a
              href={phoneHref}
              className={buttonClass("secondary", "sm")}
              onClick={() => track("call_click", { location: "lead_error" })}
            >
              <Phone aria-hidden className="size-4" /> {phoneDisplay}
            </a>
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("secondary", "sm")}
              onClick={() => track("zalo_click", { location: "lead_error" })}
            >
              <MessageCircle aria-hidden className="size-4" /> Zalo
            </a>
          </div>
        </div>
      )}
    </form>
  );
}
