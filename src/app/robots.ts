import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/shared/lib/utils";

export default function robots(): MetadataRoute.Robots {
  // Môi trường preview/dev: chặn index để không trùng nội dung với production
  if (process.env.DEPLOY_ENV !== "production") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/crm", "/cam-on", "/en/thank-you"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
