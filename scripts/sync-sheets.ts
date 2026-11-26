/**
 * Google Sheets (nơi chủ doanh nghiệp sửa) → kiểm tra Zod → ghi src/content/*.json (nơi web đọc).
 * - Service account CHỈ có quyền đọc sheet dữ liệu.
 * - Sai định dạng → dừng, KHÔNG ghi file → bản web cũ vẫn chạy. Báo rõ tab/dòng/cột.
 * Chạy: npm run sync:sheets   (cần GOOGLE_SHEETS_CONTENT_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY)
 * Cấu trúc các tab: xem docs/data-and-content.md.
 */
import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSign } from "node:crypto";
import { z } from "zod";
import { destinationSchema, envelope, faqItemSchema, pricingSchema, testimonialSchema } from "../src/domain/schemas";

const SHEET_ID = process.env.GOOGLE_SHEETS_CONTENT_ID;
const EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n");
const CONTENT = path.join(process.cwd(), "src/content");
const today = new Date().toISOString().slice(0, 10);

if (!SHEET_ID || !EMAIL || !KEY) {
  console.error(
    "✗ Thiếu GOOGLE_SHEETS_CONTENT_ID / GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_KEY (xem .env.example).",
  );
  process.exit(1);
}

async function token(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(KEY!, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${sig}`,
    }),
  });
  if (!res.ok) throw new Error(`Google token HTTP ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Đọc một tab → mảng object theo hàng tiêu đề (dòng 1). */
async function readTab(access: string, tab: string): Promise<Record<string, string>[]> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tab)}?valueRenderOption=UNFORMATTED_VALUE`,
    { headers: { authorization: `Bearer ${access}` } },
  );
  if (!res.ok) throw new Error(`Không đọc được tab "${tab}" (HTTP ${res.status})`);
  const { values = [] } = (await res.json()) as { values?: unknown[][] };
  const [header = [], ...rows] = values;
  return rows
    .filter((r) => r.some((c) => String(c ?? "").trim() !== ""))
    .map((r) => Object.fromEntries(header.map((h, i) => [String(h).trim(), String(r[i] ?? "").trim()])));
}

const bool = (v: string) => ["true", "1", "x", "có", "yes"].includes(v.toLowerCase());

function fail(tab: string, row: number, err: z.ZodError): never {
  const where = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Tab "${tab}", dòng ${row + 2}: ${where}`);
}

async function main() {
  const access = await token();

  // Tab "Destinations" giữ các trường văn bản; cột thô được gộp vào bản JSON hiện có theo id
  const current = JSON.parse(await readFile(path.join(CONTENT, "destinations.json"), "utf8"));
  const destRows = await readTab(access, "Destinations");
  const destinations = destRows.map((r, i) => {
    const base = current.data.find((d: { id: string }) => d.id === r.id) ?? {};
    const merged = {
      ...base,
      id: r.id,
      iata: r.iata,
      name: { vi: r.name_vi, en: r.name_en },
      slug: { vi: r.slug_vi, en: r.slug_en },
      transitDays: { min: Number(r.transit_min), max: Number(r.transit_max) },
      summary: { vi: r.summary_vi, en: r.summary_en },
      notes: { vi: r.notes_vi, en: r.notes_en },
      demo: bool(r.demo),
    };
    const parsed = destinationSchema.safeParse(merged);
    if (!parsed.success) fail("Destinations", i, parsed.error);
    return parsed.data;
  });

  const rateRows = await readTab(access, "Pricing");
  const rates: Record<string, { upToKg: number; perKg: number }[]> = {};
  for (const r of rateRows)
    (rates[r.destination_id] ??= []).push({ upToKg: Number(r.up_to_kg), perKg: Number(r.per_kg_vnd) });
  const surchargeRows = await readTab(access, "Surcharges");
  const pricing = pricingSchema.safeParse({
    currency: "VND",
    volumetricDivisor: 5000,
    minChargeableKg: 0.5,
    stepKg: 0.5,
    rangeSpread: 0.12,
    surchargePerKg: Object.fromEntries(surchargeRows.map((r) => [r.goods_type, Number(r.per_kg_vnd)])),
    rates,
    demo: rateRows.some((r) => bool(r.demo)),
  });
  if (!pricing.success) fail("Pricing", 0, pricing.error);

  const faqRows = await readTab(access, "FAQ");
  const faq = faqRows.map((r, i) => {
    const p = faqItemSchema.safeParse({ id: r.id, q: { vi: r.q_vi, en: r.q_en }, a: { vi: r.a_vi, en: r.a_en } });
    if (!p.success) fail("FAQ", i, p.error);
    return p.data;
  });

  const tRows = await readTab(access, "Testimonials");
  const testimonials = tRows.map((r, i) => {
    const p = testimonialSchema.safeParse({
      id: r.id,
      author: r.author,
      destination: { vi: r.destination_vi, en: r.destination_en },
      rating: Number(r.rating),
      text: { vi: r.text_vi, en: r.text_en },
      source: r.source,
      demo: bool(r.demo),
    });
    if (!p.success) fail("Testimonials", i, p.error);
    return p.data;
  });

  // Tất cả hợp lệ mới ghi (nguyên tử ở mức "hoặc ghi hết, hoặc không ghi gì")
  const out = {
    "destinations.json": { data: destinations, meta: { updatedAt: today, version: current.meta.version + 1 } },
    "pricing.json": { data: pricing.data, meta: { updatedAt: today, version: 1 } },
    "faq.json": { data: faq, meta: { updatedAt: today, version: 1 } },
    "testimonials.json": { data: testimonials, meta: { updatedAt: today, version: 1 } },
  };
  for (const [file, json] of Object.entries(out)) {
    envelope(z.unknown()).parse(json);
    await writeFile(path.join(CONTENT, file), JSON.stringify(json, null, 2) + "\n");
    console.log(`✓ ${file}`);
  }
}

main().catch((e) => {
  console.error(`✗ Đồng bộ thất bại — không ghi file nào. ${(e as Error).message}`);
  process.exit(1);
});
