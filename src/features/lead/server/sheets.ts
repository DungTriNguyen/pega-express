import "server-only";
import { sanitizeCell } from "@/domain/sheets-safety";

/**
 * Ghi một dòng vào Google Sheet "Leads" qua Sheets API v4 bằng service account.
 * Tự ký JWT RS256 bằng WebCrypto → chạy được trên Cloudflare Workers (không cần thư viện googleapis).
 */
type Creds = { email: string; privateKeyPem: string; sheetId: string; range: string };

const b64url = (input: ArrayBuffer | string) => {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

async function importKey(pem: string) {
  const body = pem
    .replace(/\\n/g, "\n")
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}

async function accessToken(email: string, pem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const key = await importKey(pem);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${b64url(sig)}`,
    }),
  });
  if (!res.ok) throw new Error(`google token HTTP ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

export async function appendLeadRow(creds: Creds, row: unknown[]): Promise<void> {
  const token = await accessToken(creds.email, creds.privateKeyPem);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(creds.sheetId)}/values/${encodeURIComponent(
    creds.range,
  )}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ values: [row.map(sanitizeCell)] }),
  });
  if (!res.ok) throw new Error(`sheets append HTTP ${res.status}`);
}
