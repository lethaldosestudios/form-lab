import type { Vec2 } from '../engine/types'

const TAU = Math.PI * 2

/** A wobbly organic circle — the classic "inflated blob". */
function blob(seed: number, n = 88, radius = 0.33): Vec2[] {
  const pts: Vec2[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU
    const wobble = 0.13 * Math.sin(a * 3 + seed) + 0.06 * Math.sin(a * 5 + seed * 2)
    const r = radius * (1 + wobble)
    pts.push({ x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r })
  }
  return pts
}

/** A classic star — a silhouette revolve could never represent this. */
function star(points = 5, outer = 0.44, inner = 0.19): Vec2[] {
  const pts: Vec2[] = []
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * TAU - Math.PI / 2
    const r = i % 2 === 0 ? outer : inner
    pts.push({ x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r })
  }
  return pts
}

/** A superellipse — e≈2 is an ellipse, larger e is boxier. */
function superellipse(rx: number, ry: number, e: number, n = 96): Vec2[] {
  const pts: Vec2[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    const x = Math.sign(ca) * Math.abs(ca) ** (2 / e)
    const y = Math.sign(sa) * Math.abs(sa) ** (2 / e)
    pts.push({ x: 0.5 + x * rx, y: 0.5 + y * ry })
  }
  return pts
}

export interface SampleSilhouette {
  id: string
  name: string
  code: string
  contour: Vec2[]
}

/**
 * Curated fallback silhouettes. Used when no reference is loaded or when
 * image contour extraction fails, so the machine is always operable
 * (engineering spec §2 #9). All contours are closed polylines in the unit square.
 */
export const SAMPLE_SILHOUETTES: readonly SampleSilhouette[] = [
  { id: 'blob', name: 'AMOEBA', code: 'SHAPE-042', contour: blob(1.3) },
  { id: 'star', name: 'STAR', code: 'SHAPE-017', contour: star() },
  { id: 'capsule', name: 'CAPSULE', code: 'SHAPE-008', contour: superellipse(0.4, 0.22, 7) },
  { id: 'gear', name: 'GEAR', code: 'SHAPE-031', contour: star(12, 0.42, 0.28) },
  { id: 'shell', name: 'SHELL', code: 'SHAPE-055', contour: blob(3.7, 88, 0.36) },
] as const

export const DEFAULT_SILHOUETTE = SAMPLE_SILHOUETTES[0]
