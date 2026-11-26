/**
 * Chặn deploy production nếu còn dữ liệu demo (🧪) — plan mục 4.4 / 4.16.
 * Chạy: DEPLOY_ENV=production npm run check:demo   (CI tự chạy trước khi build production)
 * Ở môi trường khác chỉ cảnh báo.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT = path.join(process.cwd(), "src/content");
const isProd = process.env.DEPLOY_ENV === "production";

type Hit = { file: string; path: string };

function scan(node: unknown, file: string, at: string, hits: Hit[]) {
  if (Array.isArray(node)) node.forEach((v, i) => scan(v, file, `${at}[${i}]`, hits));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === "demo" && v === true) hits.push({ file, path: at || "(root)" });
      else scan(v, file, at ? `${at}.${k}` : k, hits);
    }
  }
}

const hits: Hit[] = [];
for (const f of await readdir(CONTENT)) {
  if (!f.endsWith(".json")) continue;
  scan(JSON.parse(await readFile(path.join(CONTENT, f), "utf8")), f, "", hits);
}

if (!hits.length) {
  console.log("✓ Không còn dữ liệu demo.");
  process.exit(0);
}
const summary = Object.entries(
  hits.reduce<Record<string, number>>((acc, h) => ((acc[h.file] = (acc[h.file] ?? 0) + 1), acc), {}),
)
  .map(([f, n]) => `  - ${f}: ${n} bản ghi demo`)
  .join("\n");

if (isProd) {
  console.error(`✗ CHẶN PRODUCTION: còn dữ liệu demo cần thay bằng dữ liệu thật:\n${summary}`);
  process.exit(1);
}
console.warn(`⚠ Còn dữ liệu demo (được phép ở ${process.env.DEPLOY_ENV ?? "development"}):\n${summary}`);
