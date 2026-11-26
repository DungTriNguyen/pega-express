import "server-only";
import type { Lead } from "@/domain/schemas";

const esc = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

/** Gửi email báo lead qua Resend REST API (fetch thuần, chạy được trên Workers). */
export async function sendLeadEmail(
  cfg: { apiKey: string; from: string; to: string },
  lead: Lead,
  meta: { receivedAt: string },
): Promise<void> {
  const rows: [string, unknown][] = [
    ["Thời gian", meta.receivedAt],
    ["Họ tên", lead.name],
    ["SĐT/Zalo", lead.phone],
    ["Email", lead.email],
    ["Dịch vụ", lead.service],
    ["Nước đến", lead.destination],
    ["Cân nặng (kg)", lead.weightKg],
    ["Kích thước", lead.dimensions],
    ["Loại hàng", lead.goodsType],
    ["Ghi chú", lead.note],
    ["Ngôn ngữ", lead.locale],
    ["Trang nguồn", lead.sourcePage],
    ["UTM", lead.utm],
  ];
  const html = `<h2>Lead mới từ website Pega Express</h2><table cellpadding="6" style="border-collapse:collapse">${rows
    .filter(([, v]) => v !== undefined && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="border:1px solid #ddd"><b>${esc(k)}</b></td><td style="border:1px solid #ddd">${esc(v)}</td></tr>`,
    )
    .join("")}</table>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${cfg.apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: cfg.from,
      to: [cfg.to],
      subject: `[Lead] ${lead.name} – ${lead.destination ?? lead.service}`,
      html,
      reply_to: lead.email || undefined,
    }),
  });
  if (!res.ok) throw new Error(`resend HTTP ${res.status}`);
}
