/**
 * Schema Zod = "hợp đồng" dữ liệu. JSON hôm nay và REST API sau này đều phải khớp các schema này.
 * Tầng domain KHÔNG phụ thuộc React, Next hay bất kỳ tầng nào khác.
 */
import { z } from "zod";

export const LOCALES = ["vi", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const localizedSchema = z.object({ vi: z.string().min(1), en: z.string().min(1) });
export type Localized = z.infer<typeof localizedSchema>;

/** Bao mọi file dữ liệu theo định dạng API tương lai: { data, meta } */
export const envelope = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    data: item,
    meta: z.object({ updatedAt: z.string(), version: z.number().int().positive() }),
  });

export const faqItemSchema = z.object({
  id: z.string(),
  q: localizedSchema,
  a: localizedSchema,
});
export type FaqItem = z.infer<typeof faqItemSchema>;

export const destinationSchema = z.object({
  id: z.string().regex(/^[a-z]{2}$/),
  slug: localizedSchema,
  name: localizedSchema,
  iata: z.string().length(3),
  region: z.enum(["americas", "oceania", "asia", "europe"]),
  /** Vị trí trên bản đồ đường bay của hero (hệ tọa độ 0–1000 x 0–500) */
  map: z.object({ x: z.number(), y: z.number() }),
  transitDays: z.object({ min: z.number().int().positive(), max: z.number().int().positive() }),
  summary: localizedSchema,
  cities: z.array(z.object({ name: localizedSchema, days: z.string() })),
  allowed: z.array(localizedSchema),
  restricted: z.array(localizedSchema),
  notes: localizedSchema,
  faq: z.array(faqItemSchema),
  /** true = số liệu chưa được chủ doanh nghiệp xác nhận → CI chặn production */
  demo: z.boolean(),
});
export type Destination = z.infer<typeof destinationSchema>;

import { goodsTypes, type GoodsType } from "./constants";
export { goodsTypes, type GoodsType };

export const pricingSchema = z.object({
  currency: z.literal("VND"),
  volumetricDivisor: z.number().positive(),
  minChargeableKg: z.number().positive(),
  stepKg: z.number().positive(),
  /** Biên độ để hiển thị giá dạng khoảng "từ – đến" (phụ phí nhiên liệu, mùa cao điểm…) */
  rangeSpread: z.number().min(0).max(1),
  surchargePerKg: z.record(z.enum(goodsTypes), z.number().min(0)),
  rates: z.record(
    z.string(),
    z.array(z.object({ upToKg: z.number().positive(), perKg: z.number().positive() })).min(1),
  ),
  /** Giá "từ" hiển thị cho từng tuyến = mức giá/kg thấp nhất trong bảng giá gốc. Thiếu → lấy min của `rates`. */
  fromPerKg: z.record(z.string(), z.number().positive()).default({}),
  /** Tuyến chưa có bảng giá công khai → hiển thị "Liên hệ báo giá" */
  contactOnly: z.array(z.string()).default([]),
  /** Tuyến đông lạnh. Không có `fromPerKg` → liên hệ báo giá. */
  frozen: z
    .array(
      z.object({
        destinationId: z.string(),
        fromPerKg: z.number().positive().optional(),
        minKg: z.number().positive().optional(),
      }),
    )
    .default([]),
  /** Hạn áp dụng giá ưu đãi (ISO date) */
  validUntil: z.string().optional(),
  demo: z.boolean(),
});
export type Pricing = z.infer<typeof pricingSchema>;

export const serviceSchema = z.object({
  id: z.string(),
  slug: localizedSchema,
  icon: z.enum(["globe", "zap", "package", "truck", "snowflake"]),
  name: localizedSchema,
  short: localizedSchema,
  body: z.array(localizedSchema),
  points: z.array(localizedSchema),
});
export type Service = z.infer<typeof serviceSchema>;

export const testimonialSchema = z.object({
  id: z.string(),
  author: z.string(),
  destination: localizedSchema,
  rating: z.number().int().min(1).max(5),
  text: localizedSchema,
  source: z.enum(["google", "facebook", "zalo", "placeholder"]),
  /** Khung giữ chỗ — KHÔNG phải đánh giá thật. Bị ẩn và chặn ở production. */
  demo: z.boolean(),
});
export type Testimonial = z.infer<typeof testimonialSchema>;

export const prohibitedSchema = z.object({
  id: z.string(),
  title: localizedSchema,
  level: z.enum(["banned", "conditional"]),
  items: z.array(localizedSchema),
});
export type ProhibitedGroup = z.infer<typeof prohibitedSchema>;

export const policySchema = z.object({
  id: z.string(),
  slug: localizedSchema,
  title: localizedSchema,
  sections: z.array(z.object({ heading: localizedSchema, body: z.array(localizedSchema) })),
  demo: z.boolean(),
});
export type Policy = z.infer<typeof policySchema>;

/* ----------------------------- Lead (form) ----------------------------- */

const phoneRegex = /^(\+?84|0)(3|5|7|8|9)\d{8}$/;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "name_short").max(80),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.\-()]/g, ""))
    .refine((v) => phoneRegex.test(v), "phone_invalid"),
  email: z.union([z.literal(""), z.string().trim().email("email_invalid").max(120)]).optional(),
  service: z.enum(["international", "domestic", "packing", "other"]).default("international"),
  destination: z.string().max(40).optional(),
  weightKg: z.coerce.number().min(0).max(5000).optional(),
  dimensions: z.string().max(60).optional(),
  goodsType: z.enum(goodsTypes).optional(),
  note: z.string().max(1000).optional(),
  locale: z.enum(LOCALES),
  sourcePage: z.string().max(200).optional(),
  utm: z.string().max(300).optional(),
  consent: z.literal(true, { message: "consent_required" }),
  turnstileToken: z.string().min(1, "captcha_required"),
  /** Bẫy bot (honeypot) — người thật không thấy ô này */
  company: z.string().max(0).optional(),
});
export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;
