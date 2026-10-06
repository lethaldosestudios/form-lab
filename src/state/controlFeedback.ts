import type { MachineParams } from './params'
import type { MachineStatus } from './machineState'

export type ControlFeedback = keyof MachineParams | 'livePreview' | 'autoGenerate' | 'reference'
export const controlsLocked = (status: MachineStatus) =>
  ['MATERIALIZING', 'RENDERING', 'RETRIEVING', 'ERROR'].includes(status)
export const CONTROL_LABELS: Record<ControlFeedback, string> = {
  material: 'MATERIAL PRESETS',
  color: 'COLOR',
  transparency: 'TRANSPARENCY',
  puffiness: 'AIR PRESSURE',
  asymmetry: 'DEFORMATION',
  gloss: 'SURFACE REFLECTION',
  foldDensity: 'CREASE DENSITY',
  background: 'BACKGROUND',
  lighting: 'LIGHTING',
  shadows: 'CAST SHADOWS',
  interiorCutouts: 'INTERIOR CUTOUTS',
  livePreview: 'LIVE PREVIEW',
  autoGenerate: 'AUTO GENERATE',
  reference: 'REFERENCE',
}
