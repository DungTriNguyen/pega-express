import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("luồng chính", () => {
  test("trang chủ VI hiển thị hero, báo giá, không lỗi a11y nghiêm trọng", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Gửi hàng quốc tế");
    await expect(page).toHaveTitle(/Pega Express — Gửi hàng quốc tế/);
    const a11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(a11y.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  });

  test("báo giá nhanh trong hero ra khoảng giá", async ({ page }) => {
    await page.goto("/");
    const panel = page.locator("#hero-panel-quote");
    await panel.getByLabel("Nước đến").selectOption("au");
    await panel.getByLabel("Cân nặng (kg)").fill("3");
    await panel.getByRole("button", { name: "Tính giá" }).click();
    await expect(panel.getByText("Giá dự kiến")).toBeVisible();
  });

  test("đổi ngôn ngữ giữ đúng trang tuyến", async ({ page }) => {
    await page.goto("/gui-hang-di-uc");
    await page.getByRole("link", { name: /Ngôn ngữ/ }).click();
    await expect(page).toHaveURL(/\/en\/ship-to-australia$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ship to Australia");
  });

  test("tra cứu mở đúng link hãng", async ({ page }) => {
    await page.goto("/tra-cuu");
    await page.getByLabel("Mã vận đơn").fill("123456789012");
    await page.getByRole("button", { name: /Tra cứu/ }).click();
    await expect(page.getByRole("link", { name: /FedEx/ })).toHaveAttribute("href", /fedex\.com/);
  });

  test("404 đã dịch", async ({ page }) => {
    const res = await page.goto("/en/khong-ton-tai/abc");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("404");
  });
});
