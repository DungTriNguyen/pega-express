/**
 * Adapter REST API (dùng khi backend sẵn sàng: DATA_SOURCE=api).
 * Endpoint trả về CÙNG định dạng { data, meta } như file JSON — xem docs/architecture.md.
 * Media vẫn đọc từ manifest build-time (ảnh tĩnh trên CDN).
 */
import "server-only";
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
import type { Repositories } from "@/data/repositories";
import { createJsonRepositories } from "@/data/adapters/json";

const REVALIDATE_SECONDS = 300;

async function get<T extends z.ZodTypeAny>(path: string, schema: T, tag: string) {
  const base = process.env.API_BASE_URL;
  if (!base) throw new Error("API_BASE_URL chưa được cấu hình (DATA_SOURCE=api)");
  const res = await fetch(new URL(path, base), {
    next: { revalidate: REVALIDATE_SECONDS, tags: [tag] },
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`[api] ${path} → HTTP ${res.status}`);
  return envelope(schema).parse(await res.json()) as {
    data: z.infer<T>;
    meta: { updatedAt: string; version: number };
  };
}

export function createApiRepositories(): Repositories {
  const destinations = () => get("/v1/destinations", z.array(destinationSchema), "destinations");
  const services = () => get("/v1/services", z.array(serviceSchema), "services");
  const policies = () => get("/v1/policies", z.array(policySchema), "policies");
  const pricing = () => get("/v1/pricing", pricingSchema, "pricing");
  return {
    destinations: {
      list: async () => (await destinations()).data,
      getById: async (id) => (await destinations()).data.find((d) => d.id === id),
      getBySlug: async (slug, locale) => (await destinations()).data.find((d) => d.slug[locale] === slug),
      meta: async () => (await destinations()).meta,
    },
    pricing: {
      get: async () => (await pricing()).data,
      meta: async () => (await pricing()).meta,
    },
    services: {
      list: async () => (await services()).data,
      getBySlug: async (slug, locale) => (await services()).data.find((s) => s.slug[locale] === slug),
    },
    testimonials: {
      list: async () =>
        (await get("/v1/testimonials", z.array(testimonialSchema), "testimonials")).data.filter(
          (t) => !(process.env.DEPLOY_ENV === "production" && t.demo),
        ),
    },
    content: {
      faq: async () => (await get("/v1/faq", z.array(faqItemSchema), "faq")).data,
      prohibited: async () => (await get("/v1/prohibited", z.array(prohibitedSchema), "prohibited")).data,
      policies: async () => (await policies()).data,
      policyBySlug: async (slug, locale) => (await policies()).data.find((p) => p.slug[locale] === slug),
    },
    media: createJsonRepositories().media,
  };
}
