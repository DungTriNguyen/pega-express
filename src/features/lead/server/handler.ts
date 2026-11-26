import "server-only";
import { leadSchema } from "@/domain/schemas";
import { serverEnv } from "@/shared/config/env";
import { appendLeadRow } from "./sheets";
import { sendLeadEmail } from "./email";
import { verifyTurnstile } from "./turnstile";
import { isRateLimited } from "./rate-limit";

export type LeadResponse =
  | { ok: true; channels: { sheets: boolean; email: boolean }; dev?: boolean }
  | { ok: false; error: "validation" | "captcha" | "rate_limited" | "delivery" | "bad_request"; fields?: string[] };

/**
 * Luồng plan mục 4.5: Zod → Turnstile → giới hạn tần suất → Sheets + email.
 * Thành công nếu ít nhất một kênh ghi được. KHÔNG log dữ liệu cá nhân.
 */
export async function handleLead(
  body: unknown,
  ip: string | undefined,
): Promise<{ status: number; body: LeadResponse }> {
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return {
      status: 422,
      body: { ok: false, error: "validation", fields: parsed.error.issues.map((i) => String(i.path[0])) },
    };
  }
  const lead = parsed.data;
  if (lead.company) return { status: 200, body: { ok: true, channels: { sheets: false, email: false } } }; // honeypot: giả vờ OK

  if (isRateLimited(ip ?? "unknown")) return { status: 429, body: { ok: false, error: "rate_limited" } };

  const env = serverEnv();
  if (!(await verifyTurnstile(lead.turnstileToken, env.turnstileSecret, ip))) {
    return { status: 400, body: { ok: false, error: "captcha" } };
  }

  const receivedAt = new Date().toISOString();
  const row = [
    receivedAt,
    lead.name,
    lead.phone,
    lead.email ?? "",
    lead.service,
    lead.destination ?? "",
    lead.weightKg ?? "",
    lead.dimensions ?? "",
    lead.goodsType ?? "",
    lead.note ?? "",
    lead.locale,
    lead.sourcePage ?? "",
    lead.utm ?? "",
    lead.consent ? "có" : "không",
  ];

  const sheetsConfigured = Boolean(
    env.GOOGLE_SHEETS_LEADS_ID && env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_KEY,
  );
  const emailConfigured = Boolean(env.RESEND_API_KEY && env.LEAD_EMAIL_FROM);

  const [sheets, email] = await Promise.allSettled([
    sheetsConfigured
      ? appendLeadRow(
          {
            email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
            privateKeyPem: env.GOOGLE_SERVICE_ACCOUNT_KEY!,
            sheetId: env.GOOGLE_SHEETS_LEADS_ID!,
            range: env.GOOGLE_SHEETS_LEADS_RANGE,
          },
          row,
        )
      : Promise.reject(new Error("sheets not configured")),
    emailConfigured
      ? sendLeadEmail({ apiKey: env.RESEND_API_KEY!, from: env.LEAD_EMAIL_FROM!, to: env.LEAD_EMAIL_TO }, lead, {
          receivedAt,
        })
      : Promise.reject(new Error("email not configured")),
  ]);

  const channels = { sheets: sheets.status === "fulfilled", email: email.status === "fulfilled" };
  for (const [name, r] of Object.entries({ sheets, email })) {
    if (r.status === "rejected") console.warn(`[lead] kênh ${name} lỗi: ${(r.reason as Error).message}`);
  }

  if (channels.sheets || channels.email) return { status: 200, body: { ok: true, channels } };

  // Máy dev chưa cấu hình kênh nào: cho phép thử luồng giao diện, báo rõ là bản dev.
  if (env.DEPLOY_ENV !== "production" && !sheetsConfigured && !emailConfigured) {
    console.info("[lead] DEV: chưa cấu hình Google Sheets/Resend — lead không được lưu.");
    return { status: 200, body: { ok: true, channels, dev: true } };
  }
  return { status: 502, body: { ok: false, error: "delivery" } };
}
