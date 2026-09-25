import { MATERIAL_BY_ID } from '../data/materialPresets'
import type { MachineParams } from './params'

/** Render appearance derived from a material preset, modulated by the controls. */
export interface ObjectAppearance {
  color: string
  roughness: number
  metalness: number
  transmission: number
  opacity: number
  sheen: number
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/**
 * Resolve the final surface appearance from the loaded preset and the user's
 * overrides. The preset supplies a coherent baseline; individual controls
 * modulate it (engineering spec §7).
 */
export function appearanceForParams(params: MachineParams): ObjectAppearance {
  const preset = MATERIAL_BY_ID[params.material]

  const roughness = clamp01(preset.shader.roughness * (1 - params.gloss) + 0.04 * params.gloss)
  const metalness = clamp01(preset.shader.metalness + params.gloss * 0.12)

  let transmission = preset.shader.transmission
  let opacity = 1
  switch (params.transparency) {
    case 'translucent':
      transmission = Math.max(transmission, 0.42)
      opacity = 0.84
      break
    case 'clear':
      transmission = Math.max(transmission, 0.78)
      opacity = 0.55
      break
    default:
      transmission = preset.shader.transmission * 0.35
      opacity = 1
  }

  return {
    color: params.color,
    roughness,
    metalness,
    transmission,
    opacity,
    sheen: params.gloss,
  }
}
