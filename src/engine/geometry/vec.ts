export interface Vec3 {
  x: number
  y: number
  z: number
}

export const v3 = (x: number, y: number, z: number): Vec3 => ({ x, y, z })

export const sub3 = (a: Vec3, b: Vec3): Vec3 => v3(a.x - b.x, a.y - b.y, a.z - b.z)

export const cross3 = (a: Vec3, b: Vec3): Vec3 =>
  v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x)

export const dot3 = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z

export const length3 = (a: Vec3): number => Math.hypot(a.x, a.y, a.z)

export function normalize3(a: Vec3): Vec3 {
  const len = length3(a)
  if (len < 1e-9) return v3(0, 0, 1)
  return v3(a.x / len, a.y / len, a.z / len)
}
