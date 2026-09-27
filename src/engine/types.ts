import type { MaterialKey } from '../data/materialPresets'

/**
 * FORM//LAB — generation engine contract (handoff §29).
 *
 * This module is deliberately free of any Three.js (or rendering) import. The
 * engine emits a neutral `RenderDescriptor`; only the Renderer (the sole
 * `three` importer) turns it into scene objects. The procedural inflation
 * engine is the *first* implementation — an AI/image backend can be added
 * later behind the same interface.
 */

export interface Vec2 {
  x: number
  y: number
}

export type Transparency = 'opaque' | 'translucent' | 'clear'
export type BackgroundMode = 'studio' | 'void' | 'grid' | 'gradient'
export type LightingMode = 'soft' | 'directional' | 'dramatic'

export interface GenerationParams {
  /** Closed 2D polyline normalised to 0–1 shape space. */
  silhouetteContour: Vec2[]
  /** Interior cutouts (negative space) subtracted from the silhouette. */
  holes?: Vec2[][]
  material: MaterialKey
  color: string
  transparency: Transparency
  puffiness: number
  foldDensity: number
  asymmetry: number
  gloss: number
  background: BackgroundMode
  lighting: LightingMode
  shadows: boolean
}

/**
 * A renderer-agnostic description of what to draw. Geometry buffers for the
 * procedural engine; an image for a future AI backend.
 */
export type RenderDescriptor =
  | {
      kind: 'geometry'
      positions: Float32Array
      normals: Float32Array
      uvs: Float32Array
      indices: Uint32Array
    }
  | { kind: 'image'; dataURL: string }

export interface RenderedObject {
  id: string
  /** Data-URL thumbnail for the dispenser tray. */
  preview: string
  descriptor: RenderDescriptor
}

export interface GenerationEngine {
  generate(params: GenerationParams): Promise<RenderedObject>
  /** Supersede / cancel an in-flight request (handoff §14). */
  cancel?(): void
}
