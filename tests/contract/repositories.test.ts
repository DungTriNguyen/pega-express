/**
 * Contract test: adapter JSON và adapter REST API phải trả CÙNG kết quả cho cùng interface
 * (nguyên tắc L trong SOLID). API được giả lập bằng cách phục vụ chính các file JSON.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createJsonRepositories } from "@/data/adapters/json";
import { createApiRepositories } from "@/data/adapters/api";
import type { Repositories } from "@/data/repositories";
import destinations from "@/content/destinations.json";
import pricing from "@/content/pricing.json";
import services from "@/content/services.json";
import faq from "@/content/faq.json";
import testimonials from "@/content/testimonials.json";
import prohibited from "@/content/prohibited.json";
import policies from "@/content/policies.json";

const routes: Record<string, unknown> = {
  "/v1/destinations": destinations,
  "/v1/pricing": pricing,
  "/v1/services": services,
  "/v1/faq": faq,
  "/v1/testimonials": testimonials,
  "/v1/prohibited": prohibited,
  "/v1/policies": policies,
};

beforeAll(() => {
  process.env.API_BASE_URL = "https://api.test";
  vi.stubGlobal("fetch", async (url: URL | string) => {
    const body = routes[new URL(url).pathname];
    return new Response(JSON.stringify(body), { status: body ? 200 : 404 });
  });
});
afterAll(() => vi.unstubAllGlobals());

const adapters: [string, () => Repositories][] = [
  ["json", createJsonRepositories],
  ["api", createApiRepositories],
];

describe.each(adapters)("adapter %s", (_name, make) => {
  const repos = make();
  it("destinations: list / getById / getBySlug", async () => {
    const list = await repos.destinations.list();
    expect(list).toHaveLength(9);
    expect((await repos.destinations.getById("au"))?.slug.vi).toBe("gui-hang-di-uc");
    expect((await repos.destinations.getBySlug("ship-to-australia", "en"))?.id).toBe("au");
    expect(await repos.destinations.getBySlug("khong-co", "vi")).toBeUndefined();
  });
  it("pricing có đủ bảng giá cho mọi tuyến", async () => {
    const p = await repos.pricing.get();
    for (const d of await repos.destinations.list()) expect(p.rates[d.id]?.length).toBeGreaterThan(0);
  });
  it("content: faq, prohibited, policies", async () => {
    expect((await repos.content.faq()).length).toBeGreaterThan(0);
    expect((await repos.content.prohibited()).length).toBe(2);
    expect((await repos.content.policyBySlug("privacy", "en"))?.id).toBe("privacy");
  });
});

it("hai adapter trả kết quả giống hệt nhau", async () => {
  const [a, b] = adapters.map(([, make]) => make());
  expect(await b!.destinations.list()).toEqual(await a!.destinations.list());
  expect(await b!.pricing.get()).toEqual(await a!.pricing.get());
  expect(await b!.services.list()).toEqual(await a!.services.list());
});

it("production không bao giờ trả testimonial demo", async () => {
  const prev = process.env.DEPLOY_ENV;
  process.env.DEPLOY_ENV = "production";
  for (const [, make] of adapters) expect((await make().testimonials.list()).some((t) => t.demo)).toBe(false);
  process.env.DEPLOY_ENV = prev;
});
