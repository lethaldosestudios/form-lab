import type { Vec2 } from '../types'

/** Squared distance from point p to segment ab. */
function distSqToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const abx = bx - ax
  const aby = by - ay
  const apx = px - ax
  const apy = py - ay
  const denom = abx * abx + aby * aby
  let t = denom > 1e-12 ? (apx * abx + apy * aby) / denom : 0
  t = Math.min(1, Math.max(0, t))
  const cx = ax + t * abx
  const cy = ay + t * aby
  const dx = px - cx
  const dy = py - cy
  return dx * dx + dy * dy
}

/** Even-odd point-in-polygon test (polygon is a closed polyline). */
export function pointInPolygon(px: number, py: number, poly: readonly Vec2[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x
    const yi = poly[i].y
    const xj = poly[j].x
    const yj = poly[j].y
    const intersects = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

/** Unsigned distance from a point to the polygon boundary. */
export function distanceToPolygon(px: number, py: number, poly: readonly Vec2[]): number {
  let minSq = Infinity
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const d = distSqToSegment(px, py, poly[j].x, poly[j].y, poly[i].x, poly[i].y)
    if (d < minSq) minSq = d
  }
  return Math.sqrt(minSq)
}

/** Signed distance: negative inside, positive outside. */
export function signedDistance(px: number, py: number, poly: readonly Vec2[]): number {
  const d = distanceToPolygon(px, py, poly)
  return pointInPolygon(px, py, poly) ? -d : d
}

/**
 * A sampled signed-distance field over the unit square, with bilinear lookup.
 * Built once per reference and queried many times by the surface extractor.
 */
export class SdfField {
  readonly res: number
  private readonly values: Float32Array
  /** Largest positive inset (i.e. deepest interior distance), for normalising. */
  readonly maxInset: number

  constructor(poly: readonly Vec2[], res = 140) {
    this.res = res
    this.values = new Float32Array((res + 1) * (res + 1))
    let maxInset = 0

    for (let j = 0; j <= res; j++) {
      for (let i = 0; i <= res; i++) {
        const x = i / res
        const y = j / res
        const d = signedDistance(x, y, poly)
        this.values[j * (res + 1) + i] = d
        if (-d > maxInset) maxInset = -d
      }
    }
    this.maxInset = Math.max(maxInset, 1e-3)
  }

  /** Bilinear sample of the signed distance at (x, y) in the unit square. */
  sample(x: number, y: number): number {
    const res = this.res
    const fx = Math.min(1, Math.max(0, x)) * res
    const fy = Math.min(1, Math.max(0, y)) * res
    const i0 = Math.floor(fx)
    const j0 = Math.floor(fy)
    const i1 = Math.min(res, i0 + 1)
    const j1 = Math.min(res, j0 + 1)
    const tx = fx - i0
    const ty = fy - j0
    const stride = res + 1
    const v00 = this.values[j0 * stride + i0]
    const v10 = this.values[j0 * stride + i1]
    const v01 = this.values[j1 * stride + i0]
    const v11 = this.values[j1 * stride + i1]
    const top = v00 + (v10 - v00) * tx
    const bottom = v01 + (v11 - v01) * tx
    return top + (bottom - top) * ty
  }
}
