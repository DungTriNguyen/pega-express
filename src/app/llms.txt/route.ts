import { getRepositories } from "@/data";
import { priceFromPerKg } from "@/domain/pricing";
import { site } from "@/shared/config/site";
import { localizedUrl } from "@/shared/lib/seo";

export const dynamic = "force-static";

/** llms.txt — tóm tắt thực thể + trang chính cho công cụ AI (GEO, plan mục 4.12). */
export async function GET() {
  const repos = await getRepositories();
  const [destinations, pricing, meta] = await Promise.all([
    repos.destinations.list(),
    repos.pricing.get(),
    repos.pricing.meta(),
  ]);
  const lines = [
    `# ${site.brand}`,
    "",
    `> ${site.brand} (${site.legalName}, MST ${site.taxId}) là công ty chuyển phát và gửi hàng quốc tế tại TP.HCM, hoạt động từ ${site.foundingDate}. Văn phòng & quầy nhận hàng: ${site.operatingAddress.street}, ${site.operatingAddress.ward}, ${site.operatingAddress.city} (gần sân bay Tân Sơn Nhất). Hotline/Zalo ${site.phone.display}. Không liên quan tới Pegasystems hay xe điện PEGA.`,
    "",
    `Giá tham khảo cập nhật ${meta.updatedAt}${pricing.demo ? " (dữ liệu demo, chưa phải giá chính thức)" : ""}.`,
    "",
    "## Trang chính",
    `- [Trang chủ](${localizedUrl("/", "vi")})`,
    `- [Bảng giá](${localizedUrl("/bang-gia", "vi")})`,
    `- [Báo giá nhanh](${localizedUrl("/bao-gia", "vi")})`,
    `- [Tra cứu vận đơn](${localizedUrl("/tra-cuu", "vi")})`,
    `- [Hàng cấm gửi](${localizedUrl("/hang-cam-gui", "vi")})`,
    `- [Về Pega Express](${localizedUrl("/ve-chung-toi", "vi")})`,
    `- [Liên hệ](${localizedUrl("/lien-he", "vi")})`,
    `- [English version](${localizedUrl("/", "en")})`,
    "",
    "## Tuyến quốc tế từ TP.HCM",
    ...destinations.map(
      (d) =>
        `- [Gửi hàng đi ${d.name.vi}](${localizedUrl({ pathname: "/[routeSlug]", params: { routeSlug: d.slug.vi } }, "vi")}): ${d.transitDays.min}–${d.transitDays.max} ngày, giá từ ${priceFromPerKg(pricing, d.id)?.toLocaleString("vi-VN")} đ/kg`,
    ),
    "",
    "## Hỏa tốc nội địa",
    `- ${site.domesticCities.join(" – ")}`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
