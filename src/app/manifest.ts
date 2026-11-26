import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pega Express — Gửi hàng quốc tế & hỏa tốc",
    short_name: "Pega Express",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#1e2f38",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
