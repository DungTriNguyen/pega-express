import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Bỏ qua API, file tĩnh, nội bộ Next và các file có đuôi (ảnh, txt, xml…)
  matcher: ["/((?!api|_next|_vercel|media|brand|.*\\..*).*)"],
};
