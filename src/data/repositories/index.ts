/**
 * Interface repository — giao diện CHỈ biết các interface này, không biết dữ liệu nằm ở JSON hay REST API.
 * Interface nhỏ, đọc và ghi tách riêng (nguyên tắc I trong SOLID).
 */
import type { Destination, FaqItem, Policy, Pricing, ProhibitedGroup, Service, Testimonial } from "@/domain/schemas";

export type Meta = { updatedAt: string; version: number };

export interface DestinationRepository {
  list(): Promise<Destination[]>;
  getById(id: string): Promise<Destination | undefined>;
  getBySlug(slug: string, locale: "vi" | "en"): Promise<Destination | undefined>;
  meta(): Promise<Meta>;
}

export interface PricingRepository {
  get(): Promise<Pricing>;
  meta(): Promise<Meta>;
}

export interface ServiceRepository {
  list(): Promise<Service[]>;
  getBySlug(slug: string, locale: "vi" | "en"): Promise<Service | undefined>;
}

export interface TestimonialRepository {
  /** Đã lọc: ở production không bao giờ trả về bản ghi demo */
  list(): Promise<Testimonial[]>;
}

export interface ContentRepository {
  faq(): Promise<FaqItem[]>;
  prohibited(): Promise<ProhibitedGroup[]>;
  policies(): Promise<Policy[]>;
  policyBySlug(slug: string, locale: "vi" | "en"): Promise<Policy | undefined>;
}

export type MediaItem = {
  id: string;
  alt: { vi: string; en: string };
  real: boolean;
  width: number;
  height: number;
  widths: number[];
  blurDataURL: string;
};

export interface MediaRepository {
  get(id: string): Promise<MediaItem | undefined>;
  list(): Promise<MediaItem[]>;
}

export type Repositories = {
  destinations: DestinationRepository;
  pricing: PricingRepository;
  services: ServiceRepository;
  testimonials: TestimonialRepository;
  content: ContentRepository;
  media: MediaRepository;
};
