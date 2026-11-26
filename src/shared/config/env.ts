/**
 * Đọc + kiểm tra biến môi trường phía server bằng Zod. Không import file này từ client component.
 */
import "server-only";
import { z } from "zod";

const TURNSTILE_TEST_SECRET = "1x0000000000000000000000000000000AA"; // khóa thử công khai của Cloudflare

const schema = z.object({
  SITE_URL: z.string().url().default("http://localhost:3000"),
  DEPLOY_ENV: z.enum(["development", "preview", "production"]).default("development"),
  DATA_SOURCE: z.enum(["json", "api"]).default("json"),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  GOOGLE_SHEETS_LEADS_ID: z.string().optional(),
  GOOGLE_SHEETS_LEADS_RANGE: z.string().default("Leads!A:O"),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  LEAD_EMAIL_TO: z.string().email().default("pegaexpressvn@gmail.com"),
  LEAD_EMAIL_FROM: z.string().optional(),
});

export type ServerEnv = z.infer<typeof schema> & { turnstileSecret: string | undefined };

export function serverEnv(): ServerEnv {
  const blankToUndefined = Object.fromEntries(
    Object.keys(schema.shape).map((k) => [k, process.env[k] === "" ? undefined : process.env[k]]),
  );
  const env = schema.parse(blankToUndefined);
  return {
    ...env,
    // Production bắt buộc có secret thật; môi trường khác rơi về khóa thử nghiệm
    turnstileSecret: env.TURNSTILE_SECRET_KEY || (env.DEPLOY_ENV === "production" ? undefined : TURNSTILE_TEST_SECRET),
  };
}
