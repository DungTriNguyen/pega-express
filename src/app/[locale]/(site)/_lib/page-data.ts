/**
 * Hàm dựng dữ liệu hiển thị dùng chung cho các route (route vẫn mỏng: chỉ gọi hàm này rồi ghép section).
 * Chỉ đọc dữ liệu qua repository.
 */
import { getRepositories } from "@/data";
import { priceFromPerKg } from "@/domain/pricing";
import type { AppLocale } from "@/i18n/routing";
import type { ResponsiveImageData } from "@/shared/ui";
import type { MediaItem } from "@/data";

export async function loadQuoteData(locale: AppLocale) {
  const repos = await getRepositories();
  const [destinations, pricing] = await Promise.all([repos.destinations.list(), repos.pricing.get()]);
  return {
    pricing,
    destinations,
    quoteDestinations: destinations.map((d) => ({
      id: d.id,
      name: d.name[locale],
      iata: d.iata,
      transitMin: d.transitDays.min,
      transitMax: d.transitDays.max,
    })),
    boardRows: destinations.map((d) => ({ ...d, priceFrom: priceFromPerKg(pricing, d.id) })),
  };
}

export function toImage(m: MediaItem, locale: AppLocale): ResponsiveImageData {
  return {
    id: m.id,
    width: m.width,
    height: m.height,
    widths: m.widths,
    blurDataURL: m.blurDataURL,
    alt: m.alt[locale],
    real: m.real,
  };
}

export async function loadImages(locale: AppLocale) {
  const repos = await getRepositories();
  return (await repos.media.list()).map((m) => toImage(m, locale));
}
