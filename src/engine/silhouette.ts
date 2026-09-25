import type { Vec2 } from './types'

/**
 * Extract a silhouette contour from an uploaded reference image.
 *
 * Rasterise → threshold to a binary mask → find the largest connected
 * component → trace its outer boundary (Moore-neighbour) → simplify → normalise
 * into the unit square. Returns `null` on any failure so callers can fall back
 * to a curated sample silhouette (engineering spec §2 #9).
 */
export async function extractContourFromImage(
  source: File | string,
  resolution = 140,
): Promise<Vec2[] | null> {
  try {
    const image = await loadImage(source)
    const raster = rasterize(image, resolution)
    if (!raster) return null

    const component = largestComponent(raster.mask, raster.width, raster.height)
    if (!component) return null

    const boundary = traceBoundary(raster.mask, raster.width, raster.height, component.start)
    if (boundary.length < 12) return null

    const simplified = simplify(subsample(boundary, 200), 1.2)
    if (simplified.length < 8) return null

    return normalise(simplified)
  } catch {
    return null
  }
}

function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('FORM//LAB: reference image failed to load'))
    img.src = typeof source === 'string' ? source : URL.createObjectURL(source)
  })
}

interface Raster {
  mask: Uint8Array
  width: number
  height: number
}

function rasterize(image: HTMLImageElement, resolution: number): Raster | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  const scale = resolution / Math.max(image.naturalWidth || 1, image.naturalHeight || 1)
  const width = Math.max(1, Math.round((image.naturalWidth || 1) * scale))
  const height = Math.max(1, Math.round((image.naturalHeight || 1) * scale))
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(image, 0, 0, width, height)

  let data: Uint8ClampedArray
  try {
    data = ctx.getImageData(0, 0, width, height).data
  } catch {
    // Canvas tainted by a cross-origin image.
    return null
  }

  let hasAlpha = false
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) {
      hasAlpha = true
      break
    }
  }

  const mask = new Uint8Array(width * height)
  for (let p = 0, i = 0; p < mask.length; p++, i += 4) {
    if (hasAlpha) {
      mask[p] = data[i + 3] > 128 ? 1 : 0
    } else {
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      mask[p] = luma < 235 ? 1 : 0
    }
  }
  return { mask, width, height }
}

interface Component {
  size: number
  start: number
}

function largestComponent(mask: Uint8Array, width: number, height: number): Component | null {
  const seen = new Uint8Array(mask.length)
  let best: Component | null = null
  const stack: number[] = []

  for (let p = 0; p < mask.length; p++) {
    if (mask[p] !== 1 || seen[p]) continue
    let size = 0
    stack.length = 0
    stack.push(p)
    seen[p] = 1
    while (stack.length) {
      const q = stack.pop() as number
      size++
      const x = q % width
      const y = (q / width) | 0
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        const nq = ny * width + nx
        if (mask[nq] === 1 && !seen[nq]) {
          seen[nq] = 1
          stack.push(nq)
        }
      }
    }
    if (!best || size > best.size) best = { size, start: p }
  }
  return best
}

// 8-connected neighbours, clockwise from east.
const NEIGHBOURS = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
] as const

function traceBoundary(mask: Uint8Array, width: number, height: number, start: number): Vec2[] {
  const isForeground = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height && mask[y * width + x] === 1

  const startX = start % width
  const startY = (start / width) | 0

  const points: Vec2[] = []
  let cx = startX
  let cy = startY
  let dir = 0
  const maxSteps = width * height * 4

  for (let step = 0; step < maxSteps; step++) {
    points.push({ x: cx, y: cy })
    let moved = false
    for (let k = 0; k < 8; k++) {
      const d = (dir + k) % 8
      const nx = cx + NEIGHBOURS[d][0]
      const ny = cy + NEIGHBOURS[d][1]
      if (isForeground(nx, ny)) {
        dir = (d + 6) % 8
        cx = nx
        cy = ny
        moved = true
        break
      }
    }
    if (!moved) break
    if (cx === startX && cy === startY && points.length > 8) break
  }

  return points
}

function subsample(points: Vec2[], max: number): Vec2[] {
  if (points.length <= max) return points
  const stride = Math.ceil(points.length / max)
  const out: Vec2[] = []
  for (let i = 0; i < points.length; i += stride) out.push(points[i])
  return out
}

function distanceToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const denom = abx * abx + aby * aby
  const t = denom > 1e-9 ? ((p.x - a.x) * abx + (p.y - a.y) * aby) / denom : 0
  const cx = a.x + Math.min(1, Math.max(0, t)) * abx
  const cy = a.y + Math.min(1, Math.max(0, t)) * aby
  return Math.hypot(p.x - cx, p.y - cy)
}

/** Ramer–Douglas–Peucker simplification (in pixel space). */
function simplify(points: Vec2[], epsilon: number): Vec2[] {
  if (points.length < 3) return points
  let maxDist = 0
  let index = 0
  for (let i = 1; i < points.length - 1; i++) {
    const d = distanceToSegment(points[i], points[0], points[points.length - 1])
    if (d > maxDist) {
      maxDist = d
      index = i
    }
  }
  if (maxDist > epsilon) {
    const left = simplify(points.slice(0, index + 1), epsilon)
    const right = simplify(points.slice(index), epsilon)
    return [...left.slice(0, -1), ...right]
  }
  return [points[0], points[points.length - 1]]
}

/** Fit the traced pixels into the unit square, preserving aspect and centring. */
function normalise(points: Vec2[]): Vec2[] {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  const spanX = Math.max(maxX - minX, 1)
  const spanY = Math.max(maxY - minY, 1)
  const scale = 0.88 / Math.max(spanX, spanY)
  const offX = (1 - spanX * scale) / 2
  const offY = (1 - spanY * scale) / 2
  return points.map((p) => ({
    x: (p.x - minX) * scale + offX,
    y: (p.y - minY) * scale + offY,
  }))
}
