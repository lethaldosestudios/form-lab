export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export const clamp01 = (n: number) => clamp(n, 0, 1)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Round to the nearest multiple of `step` (used for detented controls). */
export const quantize = (n: number, step: number) => Math.round(n / step) * step
