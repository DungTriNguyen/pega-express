import type { GoodsType, Pricing } from "./schemas";
import { chargeableWeightKg, volumetricWeightKg } from "./volumetric";

export type QuoteInput = {
  destinationId: string;
  actualKg: number;
  goodsType: GoodsType;
  dims?: { lengthCm: number; widthCm: number; heightCm: number };
};

export type QuoteResult =
  | {
      ok: true;
      chargeableKg: number;
      volumetricKg: number;
      perKg: number;
      surchargePerKg: number;
      low: number;
      high: number;
      demo: boolean;
    }
  | { ok: false; reason: "unknown_destination" | "invalid_weight" | "over_max_weight" };

/** Làm tròn tiền lên nghìn đồng gần nhất. */
export const roundVnd = (v: number) => Math.ceil(v / 1000) * 1000;

export function maxSupportedKg(pricing: Pricing, destinationId: string): number | undefined {
  const brackets = pricing.rates[destinationId];
  return brackets?.at(-1)?.upToKg;
}

/** Hàm thuần: cùng đầu vào luôn ra cùng kết quả — dễ unit test từng nước, từng mốc cân. */
export function quote(pricing: Pricing, input: QuoteInput): QuoteResult {
  const brackets = pricing.rates[input.destinationId];
  if (!brackets) return { ok: false, reason: "unknown_destination" };
  if (!Number.isFinite(input.actualKg) || input.actualKg <= 0) {
    return { ok: false, reason: "invalid_weight" };
  }
  const volumetricKg = input.dims ? volumetricWeightKg(input.dims, pricing.volumetricDivisor) : 0;
  const chargeableKg = chargeableWeightKg(input.actualKg, volumetricKg, pricing.stepKg, pricing.minChargeableKg);
  const bracket = [...brackets].sort((a, b) => a.upToKg - b.upToKg).find((b) => chargeableKg <= b.upToKg);
  if (!bracket) return { ok: false, reason: "over_max_weight" };
  const surchargePerKg = pricing.surchargePerKg[input.goodsType] ?? 0;
  const base = chargeableKg * (bracket.perKg + surchargePerKg);
  return {
    ok: true,
    chargeableKg,
    volumetricKg: Number(volumetricKg.toFixed(2)),
    perKg: bracket.perKg,
    surchargePerKg,
    low: roundVnd(base),
    high: roundVnd(base * (1 + pricing.rangeSpread)),
    demo: pricing.demo,
  };
}

/** Giá "từ" (mức rẻ nhất/kg) của một tuyến — dùng cho bảng giờ bay và trang tuyến. */
export function priceFromPerKg(pricing: Pricing, destinationId: string): number | undefined {
  const brackets = pricing.rates[destinationId];
  if (!brackets?.length) return undefined;
  return Math.min(...brackets.map((b) => b.perKg));
}
