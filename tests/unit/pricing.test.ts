import { describe, expect, it } from "vitest";
import pricingJson from "@/content/pricing.json";
import { pricingSchema } from "@/domain/schemas";
import { priceFromPerKg, quote, roundVnd } from "@/domain/pricing";
import { chargeableWeightKg, roundUpToStep, volumetricWeightKg } from "@/domain/volumetric";

const pricing = pricingSchema.parse(pricingJson.data);

describe("volumetric", () => {
  it("tính D×R×C/5000", () => {
    expect(volumetricWeightKg({ lengthCm: 50, widthCm: 40, heightCm: 30 })).toBe(12);
  });
  it("trả 0 khi thiếu kích thước", () => {
    expect(volumetricWeightKg({ lengthCm: 0, widthCm: 40, heightCm: 30 })).toBe(0);
  });
  it("làm tròn lên mỗi 0,5 kg, tối thiểu 0,5", () => {
    expect(roundUpToStep(0.1)).toBe(0.5);
    expect(roundUpToStep(1.01)).toBe(1.5);
    expect(roundUpToStep(2)).toBe(2);
  });
  it("khối lượng tính cước = max(thực, quy đổi)", () => {
    expect(chargeableWeightKg(3, 12)).toBe(12);
    expect(chargeableWeightKg(7.2, 2)).toBe(7.5);
  });
});

describe("quote — từng nước, từng mốc cân", () => {
  for (const [destinationId, brackets] of Object.entries(pricing.rates)) {
    for (const b of brackets) {
      it(`${destinationId} @ ${b.upToKg} kg dùng đơn giá ${b.perKg}`, () => {
        const r = quote(pricing, { destinationId, actualKg: b.upToKg, goodsType: "general" });
        expect(r.ok).toBe(true);
        if (!r.ok) return;
        expect(r.perKg).toBe(b.perKg);
        expect(r.low).toBe(roundVnd(b.upToKg * b.perKg));
        expect(r.high).toBeGreaterThanOrEqual(r.low);
      });
    }
  }

  it("cộng phụ phí loại hàng mỗi kg", () => {
    const g = quote(pricing, { destinationId: "us", actualKg: 4, goodsType: "general" });
    const f = quote(pricing, { destinationId: "us", actualKg: 4, goodsType: "food" });
    expect(g.ok && f.ok).toBe(true);
    if (g.ok && f.ok) expect(f.low).toBe(roundVnd(4 * (g.perKg + pricing.surchargePerKg.food!)));
  });

  it("dùng khối lượng quy đổi khi thùng to nhẹ", () => {
    const r = quote(pricing, {
      destinationId: "jp",
      actualKg: 2,
      goodsType: "general",
      dims: { lengthCm: 50, widthCm: 40, heightCm: 30 },
    });
    expect(r.ok && r.chargeableKg).toBe(12);
  });

  it("báo lỗi rõ ràng", () => {
    expect(quote(pricing, { destinationId: "xx", actualKg: 1, goodsType: "general" })).toEqual({
      ok: false,
      reason: "unknown_destination",
    });
    expect(quote(pricing, { destinationId: "us", actualKg: 0, goodsType: "general" })).toEqual({
      ok: false,
      reason: "invalid_weight",
    });
    expect(quote(pricing, { destinationId: "us", actualKg: 999, goodsType: "general" })).toEqual({
      ok: false,
      reason: "over_max_weight",
    });
  });

  it("giá từ = đơn giá thấp nhất", () => {
    expect(priceFromPerKg(pricing, "us")).toBe(Math.min(...pricing.rates.us!.map((b) => b.perKg)));
  });
});
