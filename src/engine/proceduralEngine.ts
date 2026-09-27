import { MATERIAL_BY_ID } from '../data/materialPresets'
import { hexToRgb, shadeHex } from '../lib/color'
import { extractSurface } from './geometry/marchingTetrahedra'
import { SdfField } from './geometry/sdf'
import type {
  GenerationEngine,
  GenerationParams,
  RenderedObject,
  RenderDescriptor,
  Vec2,
} from './types'

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export interface ProceduralEngineOptions {
  /** Resolution of the 2D signed-distance field. */
  sdfRes?: number
  /** Marching-tetrahedra grid cell counts. */
  counts?: { x: number; y: number; z: number }
}

const DEFAULT_COUNTS = { x: 44, y: 44, z: 26 }
const DEFAULT_SDF_RES = 132

/**
 * Build the implicit field for an inflated silhouette.
 *
 *   g(x,y,z) = max( sdf2D(warp(x,y)) , |z| - thickness(x,y) )
 *
 * Solid where g < 0. This preserves the exact silhouette from the front (the
 * rim closes where the 2D SDF reaches zero) while the thickness profile gives
 * a soft, tapered inflation. Asymmetry warps the shape laterally; fold density
 * ripples the thickness into creases (handoff §13).
 */
function buildField(sdf: SdfField, params: GenerationParams) {
  const depth = sdf.maxInset
  const asymmetry = params.asymmetry
  const foldFreq = 8 + params.foldDensity * 26
  const foldAmp = params.foldDensity * 0.05
  const baseThickness = 0.05 + 0.24 * params.puffiness

  const warpX = (x: number, y: number) =>
    x + asymmetry * 0.1 * Math.sin((y - 0.5) * Math.PI * 2 + 1.1)
  const warpY = (x: number, y: number) =>
    y + asymmetry * 0.07 * Math.sin((x - 0.5) * Math.PI * 2 + 2.3)

  const thicknessAt = (x: number, y: number): number => {
    const d = sdf.sample(warpX(x, y), warpY(x, y))
    const u = clamp01(-d / depth)
    // Semicircular pillow profile: 0 at the rim, 1 deep inside.
    const profile = Math.sqrt(Math.max(0, 1 - (1 - u) * (1 - u)))
    let h = baseThickness * (0.18 + 0.82 * profile)
    h *= 1 + asymmetry * 0.35 * Math.sin(warpX(x, y) * Math.PI * 1.5)
    if (foldAmp > 0) {
      h += foldAmp * Math.sin(x * foldFreq + y * 4) * Math.sin(y * foldFreq)
    }
    return Math.max(h, 0.001)
  }

  const implicit = (x: number, y: number, z: number): number => {
    const d = sdf.sample(warpX(x, y), warpY(x, y))
    return Math.max(d, Math.abs(z) - thicknessAt(x, y))
  }

  // Analytical upper bound on |z| so the extraction grid always contains the form.
  const zBound = (baseThickness * (1 + asymmetry * 0.35) + foldAmp) * 1.15 + 0.02

  return { implicit, zBound }
}

function previewDataUrl(params: GenerationParams): string {
  const preset = MATERIAL_BY_ID[params.material]
  const light = shadeHex(params.color, 0.45)
  const dark = shadeHex(params.color, -0.4)
  // SVG y runs downward, shape space is y-up. Outlines are emitted as one path
  // with even-odd fill so interior cutouts punch through the thumbnail too.
  const loop = (points: Vec2[]) =>
    points
      .map(
        (p, i) => `${i === 0 ? 'M' : 'L'}${(p.x * 100).toFixed(1)},${((1 - p.y) * 100).toFixed(1)}`,
      )
      .join(' ') + ' Z'
  const path = [params.silhouetteContour, ...(params.holes ?? [])].map(loop).join(' ')
  const [r, g, b] = hexToRgb(params.color)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${preset.name} object preview">
  <defs>
    <radialGradient id="sheen" cx="38%" cy="30%" r="78%">
      <stop offset="0%" stop-color="${light}"/>
      <stop offset="42%" stop-color="${params.color}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </radialGradient>
  </defs>
  <path d="${path}" fill="url(#sheen)" fill-rule="evenodd" stroke="rgba(${r},${g},${b},0.6)" stroke-width="0.8"/>
</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

let objectCounter = 0

/**
 * The V1 procedural inflation engine. Produces Three-free geometry buffers
 * from a silhouette; the Renderer turns them into a mesh (engineering spec §5).
 */
export function createProceduralEngine(options: ProceduralEngineOptions = {}): GenerationEngine {
  const sdfRes = options.sdfRes ?? DEFAULT_SDF_RES
  const counts = options.counts ?? DEFAULT_COUNTS
  let cancelled = false

  return {
    cancel() {
      cancelled = true
    },
    async generate(params: GenerationParams): Promise<RenderedObject> {
      cancelled = false

      const sdf = new SdfField(params.silhouetteContour, sdfRes, params.holes ?? [])
      const { implicit, zBound } = buildField(sdf, params)

      const mesh = extractSurface(
        implicit,
        { x: [0, 1], y: [0, 1], z: [-zBound, zBound] },
        counts,
        0,
      )

      if (cancelled) {
        throw new Error('FORM//LAB: generation superseded')
      }

      const descriptor: RenderDescriptor = { kind: 'geometry', ...mesh }
      objectCounter += 1
      return {
        id: `obj-${objectCounter}-${params.material}`,
        preview: previewDataUrl(params),
        descriptor,
      }
    },
  }
}

/** Shared engine instance used by the fabrication controller. */
export const proceduralEngine = createProceduralEngine()
