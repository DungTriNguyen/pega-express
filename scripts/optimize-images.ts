/**
 * Ảnh gốc (assets-src/, KHÔNG commit vì có EXIF/GPS) → public/media/*.avif|webp + manifest.
 * - Xóa toàn bộ metadata (sharp mặc định không giữ EXIF/GPS).
 * - Không phóng to quá kích thước gốc.
 * - Sinh ảnh mờ giữ chỗ (blurDataURL) cho ResponsiveImage.
 * Chạy: npm run images
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";

const ROOT = process.cwd();
const SRC_PHOTOS = path.join(ROOT, "assets-src/photos");
const SRC_LOGO = path.join(ROOT, "assets-src/logo");
const OUT_MEDIA = path.join(ROOT, "public/media");
const OUT_BRAND = path.join(ROOT, "public/brand");
const MANIFEST = path.join(ROOT, "src/content/generated/media-manifest.json");
const WIDTHS = [480, 768, 1280, 1920];

const mediaSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      file: z.string(),
      real: z.boolean(),
      alt: z.object({ vi: z.string(), en: z.string() }),
    }),
  ),
});

async function photos() {
  const media = mediaSchema.parse(JSON.parse(await readFile(path.join(ROOT, "src/content/media.json"), "utf8")));
  await mkdir(OUT_MEDIA, { recursive: true });
  const manifest: Record<string, unknown> = {};
  for (const item of media.data) {
    const input = path.join(SRC_PHOTOS, item.file);
    if (!existsSync(input)) {
      console.warn(`! thiếu ảnh gốc ${item.file} — bỏ qua (dùng manifest cũ nếu có)`);
      continue;
    }
    const base = sharp(input).rotate(); // xoay theo EXIF rồi bỏ EXIF
    const meta = await base.metadata();
    const srcW = meta.width ?? 1280;
    const srcH = meta.height ?? 960;
    const widths = [...WIDTHS.filter((w) => w < srcW - 64), srcW].slice(0, WIDTHS.length);
    for (const w of widths) {
      await base
        .clone()
        .resize({ width: w })
        .avif({ quality: 45 })
        .toFile(path.join(OUT_MEDIA, `${item.id}-${w}.avif`));
      await base
        .clone()
        .resize({ width: w })
        .webp({ quality: 62 })
        .toFile(path.join(OUT_MEDIA, `${item.id}-${w}.webp`));
    }
    const blur = await base.clone().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
    manifest[item.id] = {
      width: srcW,
      height: srcH,
      widths,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    };
    console.log(`✓ ${item.id} (${widths.join(", ")})`);
  }
  await mkdir(path.dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, JSON.stringify({ data: manifest }, null, 2) + "\n");
}

/** Logo: lấy màu từ bản 02 (nền trắng), lấy hình dạng (alpha) từ bản 08 (trắng trên charcoal). */
async function logos() {
  const color = path.join(SRC_LOGO, "logo-02-horizontal.png");
  const mask = path.join(SRC_LOGO, "logo-08-horizontal-white-on-charcoal.png");
  const icon = path.join(SRC_LOGO, "logo-03-icon.png");
  if (!existsSync(color) || !existsSync(mask)) {
    console.warn("! thiếu logo gốc — bỏ qua");
    return;
  }
  await mkdir(OUT_BRAND, { recursive: true });
  const { data: m, info } = await sharp(mask).removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });
  const { data: c } = await sharp(color)
    .removeAlpha()
    .resize(info.width, info.height)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  const bg = 44; // độ sáng nền charcoal #1E2F38
  const colorRgba = Buffer.alloc(px * 4);
  const whiteRgba = Buffer.alloc(px * 4);
  for (let i = 0; i < px; i++) {
    const a = Math.max(0, Math.min(255, Math.round(((m[i]! - bg) / (255 - bg)) * 255)));
    colorRgba[i * 4] = c[i * 3]!;
    colorRgba[i * 4 + 1] = c[i * 3 + 1]!;
    colorRgba[i * 4 + 2] = c[i * 3 + 2]!;
    colorRgba[i * 4 + 3] = a;
    whiteRgba[i * 4] = 255;
    whiteRgba[i * 4 + 1] = 255;
    whiteRgba[i * 4 + 2] = 255;
    whiteRgba[i * 4 + 3] = a;
  }
  const raw = { raw: { width: info.width, height: info.height, channels: 4 as const } };
  for (const [name, buf] of [
    ["logo-horizontal", colorRgba],
    ["logo-horizontal-white", whiteRgba],
  ] as const) {
    const trimmed = await sharp(buf, raw).trim().png().toBuffer();
    await sharp(trimmed)
      .resize({ height: 120 })
      .webp({ quality: 90 })
      .toFile(path.join(OUT_BRAND, `${name}.webp`));
    await sharp(trimmed)
      .resize({ height: 120 })
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT_BRAND, `${name}.png`));
    const meta = await sharp(trimmed).resize({ height: 120 }).metadata();
    console.log(`✓ ${name} ${meta.width}x${meta.height}`);
  }
  if (existsSync(icon)) {
    // Icon Pegasus trên nền trắng bo góc (favicon / app icon)
    const trimmedIcon = await sharp(icon).trim({ threshold: 10 }).toBuffer();
    for (const size of [512, 192, 180, 32]) {
      const pad = Math.round(size * 0.1);
      const inner = await sharp(trimmedIcon)
        .resize({ width: size - pad * 2, height: size - pad * 2, fit: "contain", background: "#ffffff" })
        .toBuffer();
      const out = size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
      await sharp({ create: { width: size, height: size, channels: 4, background: "#ffffff" } })
        .composite([{ input: inner, gravity: "center" }])
        .png()
        .toFile(path.join(OUT_BRAND, out));
    }
    console.log("✓ icons 512/192/180/32");
  }
}

/** Ảnh OG mặc định 1200x630: nền charcoal + logo âm trắng + dòng định danh ngành. */
async function ogImage() {
  const logo = path.join(OUT_BRAND, "logo-horizontal-white.png");
  if (!existsSync(logo)) return;
  const logoBuf = await sharp(logo).resize({ height: 150 }).toBuffer();
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
      <rect width="1200" height="630" fill="#142129"/>
      <circle cx="1080" cy="90" r="260" fill="none" stroke="#eb6224" stroke-opacity="0.35" stroke-width="3"/>
      <circle cx="1130" cy="60" r="340" fill="none" stroke="#eb6224" stroke-opacity="0.18" stroke-width="2"/>
      <text x="80" y="430" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="58" fill="#faf7f2">GỬI HÀNG QUỐC TẾ &amp; HỎA TỐC</text>
      <text x="80" y="490" font-family="Arial, sans-serif" font-size="28" fill="#c3ced4">TP.HCM · Mỹ · Úc · Nhật · Hàn · Canada · Đài Loan · TQ · Malaysia · Singapore</text>
      <text x="80" y="560" font-family="Consolas, monospace" font-size="24" fill="#f59d71" letter-spacing="4">SGN → WORLD · 0773 10 89 89</text>
    </svg>`,
  );
  await sharp(svg)
    .composite([{ input: logoBuf, top: 140, left: 80 }])
    .png()
    .toFile(path.join(OUT_BRAND, "og-default.png"));
  console.log("✓ og-default.png");
}

await logos();
await ogImage();
await photos();
