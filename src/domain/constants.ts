/** Hằng số domain không phụ thuộc Zod — an toàn để import vào client component (giữ bundle nhỏ). */
export const goodsTypes = ["general", "food", "cosmetics", "medicine", "liquid"] as const;
export type GoodsType = (typeof goodsTypes)[number];
