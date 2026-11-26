"use client";

import { useId, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { goodsTypes, type GoodsType } from "@/domain/constants";
import type { Pricing } from "@/domain/schemas";
import { maxSupportedKg, quote, type QuoteResult } from "@/domain/pricing";
import { useRouter } from "@/i18n/navigation";
import { Badge, Button, FieldError, Input, Label, Select } from "@/shared/ui";
import { formatVnd } from "@/shared/lib/utils";
import { saveQuoteDraft } from "@/shared/lib/quote-draft";
import { track } from "@/features/analytics";

export type QuoteDestination = { id: string; name: string; iata: string; transitMin: number; transitMax: number };

export function QuoteCalculator({
  destinations,
  pricing,
  initialDestination,
  compact = false,
}: {
  destinations: QuoteDestination[];
  pricing: Pricing;
  initialDestination?: string;
  compact?: boolean;
}) {
  const t = useTranslations("quote");
  const tc = useTranslations("common");
  const locale = useLocale() as "vi" | "en";
  const router = useRouter();
  const uid = useId();
  const [destinationId, setDestinationId] = useState(initialDestination ?? "");
  const [goodsType, setGoodsType] = useState<GoodsType>("general");
  const [weight, setWeight] = useState("");
  const [dims, setDims] = useState({ l: "", w: "", h: "" });
  const [submitted, setSubmitted] = useState(false);

  const result: QuoteResult | undefined = useMemo(() => {
    if (!submitted) return undefined;
    const hasDims = dims.l && dims.w && dims.h;
    return quote(pricing, {
      destinationId,
      actualKg: Number(weight.replace(",", ".")),
      goodsType,
      dims: hasDims ? { lengthCm: Number(dims.l), widthCm: Number(dims.w), heightCm: Number(dims.h) } : undefined,
    });
  }, [submitted, pricing, destinationId, weight, goodsType, dims]);

  const dest = destinations.find((d) => d.id === destinationId);
  const errorText =
    result && !result.ok
      ? t(`errors.${result.reason}`, { max: maxSupportedKg(pricing, destinationId) ?? 30 })
      : undefined;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    track("quote_calculate", { destination: destinationId, weight });
  };

  const goExact = () => {
    saveQuoteDraft({
      destination: destinationId,
      weightKg: Number(weight.replace(",", ".")) || undefined,
      dimensions: dims.l && dims.w && dims.h ? `${dims.l}x${dims.w}x${dims.h}` : undefined,
      goodsType,
    });
    router.push({ pathname: "/bao-gia", hash: "lead-form" } as never);
  };

  const ids = { dest: `${uid}-dest`, goods: `${uid}-goods`, weight: `${uid}-w`, err: `${uid}-err` };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" aria-describedby={errorText ? ids.err : undefined}>
      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <Label htmlFor={ids.dest}>{t("destination")}</Label>
          <Select
            id={ids.dest}
            value={destinationId}
            onChange={(e) => {
              setDestinationId(e.target.value);
              setSubmitted(false);
            }}
            required
          >
            <option value="">{t("chooseDestination")}</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} · {d.iata}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={ids.goods}>{t("goodsType")}</Label>
          <Select
            id={ids.goods}
            value={goodsType}
            onChange={(e) => {
              setGoodsType(e.target.value as GoodsType);
              setSubmitted(false);
            }}
          >
            {goodsTypes.map((g) => (
              <option key={g} value={g}>
                {t(`goods.${g}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className={compact ? "grid grid-cols-[1fr] gap-4" : "grid gap-4 sm:grid-cols-[1fr_2fr]"}>
        <div>
          <Label htmlFor={ids.weight}>{t("weight")}</Label>
          <Input
            id={ids.weight}
            inputMode="decimal"
            autoComplete="off"
            placeholder="2.5"
            value={weight}
            onChange={(e) => {
              setWeight(e.target.value);
              setSubmitted(false);
            }}
            aria-invalid={result && !result.ok && result.reason === "invalid_weight" ? true : undefined}
          />
        </div>
        {!compact && (
          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium">
              {t("dimensions")} <span className="font-normal text-muted">({tc("optional")})</span>
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {(["l", "w", "h"] as const).map((k) => (
                <Input
                  key={k}
                  inputMode="numeric"
                  aria-label={t(k === "l" ? "length" : k === "w" ? "width" : "height")}
                  placeholder={t(k === "l" ? "length" : k === "w" ? "width" : "height")}
                  value={dims[k]}
                  onChange={(e) => {
                    setDims((d) => ({ ...d, [k]: e.target.value.replace(/[^\d.]/g, "") }));
                    setSubmitted(false);
                  }}
                />
              ))}
            </div>
          </fieldset>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg">
        {t("calculate")}
      </Button>

      <div aria-live="polite" className="min-h-6">
        {errorText && <FieldError id={ids.err}>{errorText}</FieldError>}
        {!result && !compact && <p className="text-sm text-muted">{t("empty")}</p>}
        {result?.ok && (
          <div className="border-t-2 border-dashed border-border-strong pt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-muted">{t("resultTitle")}</p>
              {result.demo && <Badge tone="warning">{tc("demoPrice")}</Badge>}
            </div>
            <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-brand-strong sm:text-4xl">
              {formatVnd(result.low, locale)} – {formatVnd(result.high, locale)}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
              <dt className="text-muted">{t("chargeable")}</dt>
              <dd className="text-right">{result.chargeableKg} kg</dd>
              {result.volumetricKg > 0 && (
                <>
                  <dt className="text-muted">{t("volumetric")}</dt>
                  <dd className="text-right">{result.volumetricKg} kg</dd>
                </>
              )}
              <dt className="text-muted">{t("rate")}</dt>
              <dd className="text-right">
                {formatVnd(result.perKg, locale)}
                {tc("perKg")}
              </dd>
              {result.surchargePerKg > 0 && (
                <>
                  <dt className="text-muted">{t("surcharge")}</dt>
                  <dd className="text-right">
                    +{formatVnd(result.surchargePerKg, locale)}
                    {tc("perKg")}
                  </dd>
                </>
              )}
              {dest && (
                <>
                  <dt className="text-muted">{t("transit")}</dt>
                  <dd className="text-right">{tc("days", { min: dest.transitMin, max: dest.transitMax })}</dd>
                </>
              )}
            </dl>
            <p className="mt-3 text-xs text-muted">{t("disclaimer")}</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-3 w-full"
              onClick={goExact}
              icon={<ArrowRight aria-hidden className="size-4" />}
            >
              {t("getExact")}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
