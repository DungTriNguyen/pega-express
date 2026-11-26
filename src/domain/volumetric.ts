/** Khối lượng quy đổi (thể tích) theo chuẩn chuyển phát hàng không: D × R × C (cm) / hệ số. */
export function volumetricWeightKg(
  dims: { lengthCm: number; widthCm: number; heightCm: number },
  divisor = 5000,
): number {
  const { lengthCm, widthCm, heightCm } = dims;
  if ([lengthCm, widthCm, heightCm].some((v) => !Number.isFinite(v) || v <= 0)) return 0;
  return (lengthCm * widthCm * heightCm) / divisor;
}

/** Làm tròn LÊN theo bước (mặc định 0,5 kg), không nhỏ hơn mức tối thiểu. */
export function roundUpToStep(kg: number, step = 0.5, min = 0.5): number {
  if (!Number.isFinite(kg) || kg <= 0) return min;
  const rounded = Math.ceil(kg / step - 1e-9) * step;
  return Math.max(min, Number(rounded.toFixed(2)));
}

/** Khối lượng tính cước = max(thực, quy đổi), làm tròn lên theo bước. */
export function chargeableWeightKg(actualKg: number, volumetricKg: number, step = 0.5, min = 0.5): number {
  return roundUpToStep(Math.max(actualKg || 0, volumetricKg || 0), step, min);
}
