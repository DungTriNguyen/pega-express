import { describe, expect, it } from "vitest";
import { detectCarriers, normalizeTrackingCode } from "@/domain/carriers";
import { sanitizeCell } from "@/domain/sheets-safety";
import { leadSchema } from "@/domain/schemas";

describe("nhận diện mã vận đơn", () => {
  it("UPS 1Z…", () => {
    expect(detectCarriers("1Z 999 AA1 01 2345 6784").map((c) => c.id)).toEqual(["ups"]);
  });
  it("FedEx 12 số", () => {
    expect(detectCarriers("123456789012").map((c) => c.id)).toEqual(["fedex"]);
  });
  it("DHL 10 số", () => {
    expect(detectCarriers("1234567890").map((c) => c.id)).toEqual(["dhl"]);
  });
  it("không nhận diện được", () => {
    expect(detectCarriers("ABC")).toEqual([]);
    expect(detectCarriers("HELLO-WORLD-123")).toEqual([]);
  });
  it("chuẩn hóa khoảng trắng, gạch, chữ thường", () => {
    expect(normalizeTrackingCode(" 1z-999 aa1 ")).toBe("1Z999AA1");
  });
  it("tạo link tra cứu chính thức có mã đã encode", () => {
    const [dhl] = detectCarriers("1234567890");
    expect(dhl!.trackingUrl("1234567890", "vi")).toContain("dhl.com/vn-vi");
  });
});

describe("chống chèn công thức Google Sheets", () => {
  it.each(["=SUM(A1)", "+1", "-1", "@x"])("thêm tiền tố ' cho %s", (v) => {
    expect(sanitizeCell(v)).toBe(`'${v}`);
  });
  it("giữ nguyên giá trị thường", () => {
    expect(sanitizeCell("Nguyễn Văn A")).toBe("Nguyễn Văn A");
    expect(sanitizeCell(undefined)).toBe("");
  });
});

describe("lead schema", () => {
  const valid = {
    name: "Nguyễn Văn A",
    phone: "0773 10 89 89",
    locale: "vi",
    consent: true,
    turnstileToken: "tok",
  };
  it("chấp nhận dữ liệu hợp lệ, chuẩn hóa SĐT", () => {
    const r = leadSchema.parse(valid);
    expect(r.phone).toBe("0773108989");
  });
  it("từ chối SĐT sai, thiếu đồng ý", () => {
    expect(leadSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });
  it("chặn honeypot có giá trị", () => {
    expect(leadSchema.safeParse({ ...valid, company: "bot" }).success).toBe(false);
  });
});
