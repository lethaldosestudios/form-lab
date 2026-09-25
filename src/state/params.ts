import { MATERIAL_BY_ID, type MaterialKey } from '../data/materialPresets'
import type { BackgroundMode, LightingMode, Transparency } from '../engine/types'

/**
 * The user-facing generation parameters. These are the machine's "settings" —
 * they are translated into engine `GenerationParams` at generate time and are
 * deliberately decoupled from both the machine status and the engine internals.
 */
export interface MachineParams {
  material: MaterialKey
  color: string
  transparency: Transparency
  lighting: LightingMode
  background: BackgroundMode
  /** 0–1 → AIR PRESSURE */
  puffiness: number
  /** 0–1 → CREASE DENSITY */
  foldDensity: number
  /** 0–1 → DEFORMATION */
  asymmetry: number
  /** 0–1 → SURFACE REFLECTION */
  gloss: number
  shadows: boolean
  interiorCutouts: boolean
}

export const DEFAULT_PARAMS: MachineParams = {
  material: 'vinyl',
  color: MATERIAL_BY_ID.vinyl.color,
  transparency: 'opaque',
  lighting: 'soft',
  background: 'studio',
  puffiness: MATERIAL_BY_ID.vinyl.inflation.puffiness,
  foldDensity: MATERIAL_BY_ID.vinyl.inflation.foldDensity,
  asymmetry: 0.25,
  gloss: MATERIAL_BY_ID.vinyl.inflation.gloss,
  shadows: true,
  interiorCutouts: false,
}

export const TRANSPARENCY_OPTIONS: readonly { value: Transparency; label: string }[] = [
  { value: 'opaque', label: 'OPAQUE' },
  { value: 'translucent', label: 'TRANSLUCENT' },
  { value: 'clear', label: 'CLEAR' },
] as const

export const BACKGROUND_OPTIONS: readonly { value: BackgroundMode; label: string }[] = [
  { value: 'studio', label: 'STUDIO' },
  { value: 'void', label: 'VOID' },
  { value: 'grid', label: 'GRID' },
  { value: 'gradient', label: 'GRADIENT' },
] as const

export const LIGHTING_OPTIONS: readonly { value: LightingMode; label: string }[] = [
  { value: 'soft', label: 'SOFT' },
  { value: 'directional', label: 'DIRECTIONAL' },
  { value: 'dramatic', label: 'DRAMATIC' },
] as const
