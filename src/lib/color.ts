function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)))
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim()
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6)
  const value = Number.parseInt(full, 16)
  if (Number.isNaN(value)) return [128, 128, 128]
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((n) => clampByte(n).toString(16).padStart(2, '0')).join('')}`
}

/** Lighten (amount > 0) or darken (amount < 0) a hex color by a 0–1 fraction. */
export function shadeHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  if (amount >= 0) {
    return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount)
  }
  const k = 1 + amount
  return rgbToHex(r * k, g * k, b * k)
}
