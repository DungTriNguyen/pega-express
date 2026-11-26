/**
 * Adapter JSON: đọc src/content/*.json (sinh từ Google Sheets), kiểm tra bằng Zod lúc build.
 * Đây là nơi DUY NHẤT được import content/*.json (lint chặn ở nơi khác).
 */
import { z } from "zod";
import {
  destinationSchema,
  envelope,
  faqItemSchema,
  policySchema,
  pricingSchema,
  prohibitedSchema,
  serviceSchema,
  testimonialSchema,
} from "@/domain/schemas";
import type { MediaItem, Repositories } from "@/data/repositories";
import destinationsJson from "@/content/destinations.json";
import pricingJson from "@/content/pricing.json";
import servicesJson from "@/content/services.json";
import faqJson from "@/content/faq.json";
import testimonialsJson from "@/content/testimonials.json";
import prohibitedJson from "@/content/prohibited.json";
import policiesJson from "@/content/policies.json";
import mediaJson from "@/content/media.json";
import mediaManifestJson from "@/content/generated/media-manifest.json";

const isProduction = () => process.env.DEPLOY_ENV === "production";

const parse = <T extends z.ZodTypeAny>(schema: T, data: unknown, file: string) => {
  const result = envelope(schema).safeParse(data);
  if (!result.success) {
    throw new Error(`[content] ${file} sai định dạng:\n${z.prettifyError(result.error)}`);
  }
  return result.data as { data: z.infer<T>; meta: { updatedAt: string; version: number } };
};

const destinations = parse(z.array(destinationSchema), destinationsJson, "destinations.json");
const pricing = parse(pricingSchema, pricingJson, "pricing.json");
const services = parse(z.array(serviceSchema), servicesJson, "services.json");
const faq = parse(z.array(faqItemSchema), faqJson, "faq.json");
const testimonials = parse(z.array(testimonialSchema), testimonialsJson, "testimonials.json");
const prohibited = parse(z.array(prohibitedSchema), prohibitedJson, "prohibited.json");
const policies = parse(z.array(policySchema), policiesJson, "policies.json");

const manifest = z
  .object({
    data: z.record(
      z.string(),
      z.object({
        width: z.number(),
        height: z.number(),
        widths: z.array(z.number()),
        blurDataURL: z.string(),
      }),
    ),
  })
  .parse(mediaManifestJson).data;

const media: MediaItem[] = mediaJson.data
  .filter((m) => manifest[m.id])
  .map((m) => ({ id: m.id, alt: m.alt, real: m.real, ...manifest[m.id]! }));

export function createJsonRepositories(): Repositories {
  return {
    destinations: {
      list: async () => destinations.data,
      getById: async (id) => destinations.data.find((d) => d.id === id),
      getBySlug: async (slug, locale) => destinations.data.find((d) => d.slug[locale] === slug),
      meta: async () => destinations.meta,
    },
    pricing: {
      get: async () => pricing.data,
      meta: async () => pricing.meta,
    },
    services: {
      list: async () => services.data,
      getBySlug: async (slug, locale) => services.data.find((s) => s.slug[locale] === slug),
    },
    testimonials: {
      list: async () => testimonials.data.filter((t) => !(isProduction() && t.demo)),
    },
    content: {
      faq: async () => faq.data,
      prohibited: async () => prohibited.data,
      policies: async () => policies.data,
      policyBySlug: async (slug, locale) => policies.data.find((p) => p.slug[locale] === slug),
    },
    media: {
      get: async (id) => media.find((m) => m.id === id),
      list: async () => media,
    },
  };
}
