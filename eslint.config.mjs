import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * Quy tắc mã nguồn được MÁY kiểm tra (plan mục 4.14):
 *  - Chiều phụ thuộc: app → features → shared → domain; data chỉ được app/features dùng; domain không phụ thuộc gì.
 *  - Tính năng này không import "ruột" tính năng kia — chỉ qua index.ts (hoặc server.ts).
 *  - Chỉ tầng data được import content/*.json.
 *  - Cấm any, cấm @ts-ignore không ghi lý do, cấm mã màu cứng trong component.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "proxy", pattern: "src/proxy.ts", partialMatch: false },
        { type: "feature", pattern: "src/features/*", capture: ["feature"] },
        { type: "shared", pattern: "src/shared/**" },
        { type: "data", pattern: "src/data/**" },
        { type: "content", pattern: "src/content/**" },
        { type: "domain", pattern: "src/domain/**" },
        { type: "i18n", pattern: "src/i18n/**" },
        { type: "styles", pattern: "src/styles/**" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "app" } },
              allow: [
                { to: { element: { type: "app" } } },
                { to: { element: { type: "feature" } } },
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "data" } } },
                { to: { element: { type: "domain" } } },
                { to: { element: { type: "i18n" } } },
                { to: { element: { type: "styles" } } },
              ],
            },
            { from: { element: { type: "proxy" } }, allow: [{ to: { element: { type: "i18n" } } }] },
            {
              from: { element: { type: "feature" } },
              allow: [
                { to: { element: { type: "feature" } } },
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "domain" } } },
                { to: { element: { type: "i18n" } } },
              ],
            },
            {
              from: { element: { type: "shared" } },
              allow: [
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "domain" } } },
                { to: { element: { type: "i18n" } } },
              ],
            },
            {
              from: { element: { type: "data" } },
              allow: [
                { to: { element: { type: "data" } } },
                { to: { element: { type: "content" } } },
                { to: { element: { type: "domain" } } },
              ],
            },
            { from: { element: { type: "i18n" } }, allow: [{ to: { element: { type: "i18n" } } }] },
            { from: { element: { type: "domain" } }, allow: [{ to: { element: { type: "domain" } } }] },
          ],
        },
      ],
      // Tính năng khác chỉ được dùng cổng công khai index.ts / server.ts
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*", "!@/features/*/server"],
              message: "Chỉ import tính năng qua index.ts (hoặc server.ts).",
            },
            { group: ["@/content/*"], message: "Chỉ tầng data được đọc content/*.json — dùng repository." },
          ],
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-ignore": "allow-with-description", minimumDescriptionLength: 10 },
      ],
    },
  },
  {
    // Tầng data và test được đọc content/*.json
    files: ["src/data/**", "tests/**"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    files: ["src/**/*.tsx"],
    ignores: ["src/app/not-found.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
          message: "Không viết mã màu cứng — dùng design token (src/styles/tokens.css).",
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    ".open-next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
