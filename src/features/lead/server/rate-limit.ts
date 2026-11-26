import "server-only";

/**
 * Giới hạn tần suất theo IP — bản trong bộ nhớ (theo từng isolate Worker), đủ chặn gửi lặp cơ bản.
 * Production nên bật thêm Cloudflare Rate Limiting Rule cho /api/lead (docs/deployment.md).
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}
