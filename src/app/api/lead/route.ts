import { NextResponse, type NextRequest } from "next/server";
import { handleLead } from "@/features/lead/server";

/** POST /api/lead — nhận form → Google Sheets + email (plan mục 4.5). */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 415 });
  }
  const raw = await req.text();
  if (raw.length > 10_000) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const ip =
    req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
  const result = await handleLead(body, ip);
  return NextResponse.json(result.body, { status: result.status, headers: { "cache-control": "no-store" } });
}
