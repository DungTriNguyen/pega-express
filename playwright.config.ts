import { defineConfig, devices } from "@playwright/test";

/** E2E: luồng chính × 3 kích thước (375/768/1440) × 2 chế độ màu; ngôn ngữ kiểm tra trong từng test. */
const sizes = [
  { name: "mobile", viewport: { width: 375, height: 812 } },
  { name: "tablet", viewport: { width: 768, height: 1024 } },
  { name: "desktop", viewport: { width: 1440, height: 900 } },
];
const schemes = ["light", "dark"] as const;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000", trace: "off" },
  projects: sizes.flatMap((s) =>
    schemes.map((colorScheme) => ({
      name: `${s.name}-${colorScheme}`,
      use: { ...devices["Desktop Chrome"], viewport: s.viewport, colorScheme },
    })),
  ),
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "npm run start", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120_000 },
});
