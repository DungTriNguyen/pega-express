"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { chargeableWeightKg, volumetricWeightKg } from "@/domain/volumetric";
import { Input, Label } from "@/shared/ui";

/** Công cụ tính khối lượng quy đổi — tính ngay khi gõ, không cần nút. */
export function VolumetricCalculator({ divisor = 5000 }: { divisor?: number }) {
  const t = useTranslations("pages.volumetric");
  const tq = useTranslations("quote");
  const uid = useId();
  const [v, setV] = useState({ l: "", w: "", h: "", kg: "" });
  const num = (s: string) => Number(s.replace(",", ".")) || 0;
  const vol = volumetricWeightKg({ lengthCm: num(v.l), widthCm: num(v.w), heightCm: num(v.h) }, divisor);
  const ready = vol > 0 || num(v.kg) > 0;
  const charge = chargeableWeightKg(num(v.kg), vol);
  const field = (k: keyof typeof v, label: string) => (
    <div>
      <Label htmlFor={`${uid}-${k}`}>{label}</Label>
      <Input
        id={`${uid}-${k}`}
        inputMode="decimal"
        value={v[k]}
        onChange={(e) => setV((s) => ({ ...s, [k]: e.target.value.replace(/[^\d.,]/g, "") }))}
      />
    </div>
  );
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-4">
        {field("l", `${tq("length")} (cm)`)}
        {field("w", `${tq("width")} (cm)`)}
        {field("h", `${tq("height")} (cm)`)}
        {field("kg", t("actual"))}
      </div>
      <div aria-live="polite" className="mt-6 border-t-2 border-dashed border-border-strong pt-5">
        {ready && (
          <>
            <p className="font-mono text-sm text-muted">{t("resultVol", { kg: vol.toFixed(2) })}</p>
            <p className="mt-1 font-display text-4xl font-extrabold text-brand-strong">{t("result", { kg: charge })}</p>
          </>
        )}
      </div>
    </div>
  );
}
