/**
 * FORM//LAB — Material presets (handoff §10).
 *
 * Each preset is a *complete* visual recipe, not just a set of parameter
 * overrides (engineering spec §2 #6): it supplies a coherent shader + inflation
 * baseline plus a default color. Individual controls may override any field.
 */

export type MaterialKey =
  | 'soft-plastic'
  | 'candy'
  | 'toy'
  | 'vinyl'
  | 'rubber'
  | 'silicone'
  | 'jelly'
  | 'chrome'
  | 'gloss-plastic'
  | 'translucent-plastic'

export interface MaterialShader {
  roughness: number
  metalness: number
  transmission: number
  opacity: number
}

export interface MaterialInflation {
  puffiness: number
  foldDensity: number
  gloss: number
}

export interface MaterialVisual {
  highlightIntensity: number
  subsurface: number
}

export interface MaterialPreset {
  id: MaterialKey
  name: string
  /** Printed cartridge code, e.g. "VINYL-07" (handoff §10). */
  code: string
  color: string
  shader: MaterialShader
  inflation: MaterialInflation
  visual: MaterialVisual
}

export const MATERIAL_PRESETS: readonly MaterialPreset[] = [
  {
    id: 'soft-plastic',
    name: 'Soft Plastic',
    code: 'SP-01',
    color: '#F2F0EB',
    shader: { roughness: 0.55, metalness: 0.04, transmission: 0, opacity: 1 },
    inflation: { puffiness: 0.55, foldDensity: 0.3, gloss: 0.35 },
    visual: { highlightIntensity: 0.4, subsurface: 0 },
  },
  {
    id: 'candy',
    name: 'Candy',
    code: 'CN-02',
    color: '#FF4D8D',
    shader: { roughness: 0.18, metalness: 0.05, transmission: 0.25, opacity: 0.95 },
    inflation: { puffiness: 0.72, foldDensity: 0.25, gloss: 0.85 },
    visual: { highlightIntensity: 0.9, subsurface: 0.4 },
  },
  {
    id: 'toy',
    name: 'Toy',
    code: 'TY-03',
    color: '#FF6A00',
    shader: { roughness: 0.35, metalness: 0.03, transmission: 0, opacity: 1 },
    inflation: { puffiness: 0.8, foldDensity: 0.35, gloss: 0.55 },
    visual: { highlightIntensity: 0.6, subsurface: 0.1 },
  },
  {
    id: 'vinyl',
    name: 'Vinyl',
    code: 'VINYL-07',
    color: '#FF4500',
    shader: { roughness: 0.25, metalness: 0.05, transmission: 0, opacity: 1 },
    inflation: { puffiness: 0.7, foldDensity: 0.3, gloss: 0.6 },
    visual: { highlightIntensity: 0.8, subsurface: 0 },
  },
  {
    id: 'rubber',
    name: 'Rubber',
    code: 'RB-04',
    color: '#2C2F33',
    shader: { roughness: 0.9, metalness: 0.02, transmission: 0, opacity: 1 },
    inflation: { puffiness: 0.62, foldDensity: 0.5, gloss: 0.12 },
    visual: { highlightIntensity: 0.15, subsurface: 0 },
  },
  {
    id: 'silicone',
    name: 'Silicone',
    code: 'SI-05',
    color: '#9AC7BF',
    shader: { roughness: 0.5, metalness: 0.02, transmission: 0.35, opacity: 0.9 },
    inflation: { puffiness: 0.78, foldDensity: 0.4, gloss: 0.4 },
    visual: { highlightIntensity: 0.45, subsurface: 0.8 },
  },
  {
    id: 'jelly',
    name: 'Jelly',
    code: 'JL-06',
    color: '#6EE7B7',
    shader: { roughness: 0.12, metalness: 0.0, transmission: 0.6, opacity: 0.82 },
    inflation: { puffiness: 0.88, foldDensity: 0.2, gloss: 0.9 },
    visual: { highlightIntensity: 1.0, subsurface: 1 },
  },
  {
    id: 'chrome',
    name: 'Chrome',
    code: 'CH-08',
    color: '#C9CDD2',
    shader: { roughness: 0.06, metalness: 1, transmission: 0, opacity: 1 },
    inflation: { puffiness: 0.5, foldDensity: 0.2, gloss: 0.98 },
    visual: { highlightIntensity: 1, subsurface: 0 },
  },
  {
    id: 'gloss-plastic',
    name: 'Gloss Plastic',
    code: 'GP-09',
    color: '#2E6BFF',
    shader: { roughness: 0.08, metalness: 0.1, transmission: 0, opacity: 1 },
    inflation: { puffiness: 0.66, foldDensity: 0.28, gloss: 0.95 },
    visual: { highlightIntensity: 0.95, subsurface: 0 },
  },
  {
    id: 'translucent-plastic',
    name: 'Translucent Plastic',
    code: 'TP-10',
    color: '#A9D6FF',
    shader: { roughness: 0.3, metalness: 0.05, transmission: 0.5, opacity: 0.85 },
    inflation: { puffiness: 0.6, foldDensity: 0.3, gloss: 0.5 },
    visual: { highlightIntensity: 0.6, subsurface: 0.3 },
  },
] as const

export const MATERIAL_BY_ID: Record<MaterialKey, MaterialPreset> = Object.fromEntries(
  MATERIAL_PRESETS.map((preset) => [preset.id, preset]),
) as Record<MaterialKey, MaterialPreset>

/** Preset color chips from handoff §11. */
export const COLOR_PRESETS: readonly { name: string; value: string }[] = [
  { name: 'FLAME', value: '#FF4500' },
  { name: 'LIME', value: '#8FE04A' },
  { name: 'CYAN', value: '#22D3EE' },
  { name: 'VIOLET', value: '#8B5CF6' },
  { name: 'WHITE', value: '#F5F5F5' },
  { name: 'BLACK', value: '#15171A' },
] as const
