/**
 * Thông tin doanh nghiệp (NAP) — MỘT nguồn duy nhất cho header, footer, schema.org, trang Về chúng tôi.
 * Chỉ ghi số liệu đã xác minh (plan v1.4 mục 1).
 */
export const site = {
  brand: "Pega Express",
  legalName: "CÔNG TY TNHH PEGA EXPRESS",
  internationalName: "PEGA EXPRESS COMPANY LIMITED",
  taxId: "0319722024",
  foundingDate: "2026-09-25",
  representative: "Phạm Trung Đức",
  phone: { display: "0773 10 89 89", e164: "+84773108989" },
  email: "pegaexpressvn@gmail.com",
  hours: { open: "08:00", close: "17:30", display: "8:00 – 17:30" },
  /** Địa chỉ vận hành — dùng cho Google Business Profile, LocalBusiness, khách đến gửi hàng */
  operatingAddress: {
    street: "431 Tân Sơn",
    ward: "Phường An Hội Tây",
    city: "TP. Hồ Chí Minh",
    cityEn: "Ho Chi Minh City",
    country: "VN",
    plusCode: "RJHV+J3",
    geo: { lat: 10.8291, lng: 106.6428 },
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pega+Express+431+T%C3%A2n+S%C6%A1n",
  },
  /** Địa chỉ trụ sở đăng ký (theo đăng ký thuế) — chỉ ghi ở footer / Về chúng tôi */
  registeredAddress: "Phòng 702A, Tầng 7, Tòa nhà Centre Point, 106 Nguyễn Văn Trỗi, Phường Phú Nhuận, TP. Hồ Chí Minh",
  social: {
    facebook: "https://www.facebook.com/pegaexpress",
    tiktok: "https://www.tiktok.com/@pegaexpress.vn",
  },
  domesticCities: ["Hà Nội", "Hải Phòng", "Đà Nẵng", "TP.HCM", "Cần Thơ"],
  domesticCitiesEn: ["Hanoi", "Hai Phong", "Da Nang", "HCMC", "Can Tho"],
} as const;

export const zaloUrl = () =>
  process.env.NEXT_PUBLIC_ZALO_OA_URL || `https://zalo.me/${site.phone.e164.replace("+84", "0")}`;

export const messengerUrl = () => process.env.NEXT_PUBLIC_MESSENGER_URL || "https://m.me/pegaexpress";
