/**
 * FORM//LAB — static machine copy & configuration.
 *
 * All fixed labels, markings and technical text live here so the machine's
 * "printed" identity is centralized (handoff §4, §7 rule 9) and never
 * scattered through components.
 */

export const MACHINE = {
  brand: 'FORM//LAB',
  model: 'IM-01',
  unitName: 'INFLATION & MATERIALIZATION UNIT',
  type: '3D-FAB',
  input: '2D VECTOR / RASTER',
  output: 'INFLATED FORM',
  rev: '0.9.0',
  serial: 'SN-IM01-0042',
  origin: 'INDUSTRIAL DESIGN LAB · BAY 07',
} as const

export type IndicatorId =
  | 'power'
  | 'reference'
  | 'material'
  | 'inflation'
  | 'processing'
  | 'ready'
  | 'dispense'

export interface IndicatorDef {
  id: IndicatorId
  label: string
  /** Functional color semantics from handoff §22. */
  tone: 'green' | 'amber' | 'red' | 'neutral'
}

/** Ordered exactly as the handoff lists them (§7). */
export const INDICATORS: readonly IndicatorDef[] = [
  { id: 'power', label: 'POWER', tone: 'neutral' },
  { id: 'reference', label: 'REFERENCE', tone: 'amber' },
  { id: 'material', label: 'MATERIAL', tone: 'neutral' },
  { id: 'inflation', label: 'INFLATION', tone: 'amber' },
  { id: 'processing', label: 'PROCESSING', tone: 'amber' },
  { id: 'ready', label: 'READY', tone: 'green' },
  { id: 'dispense', label: 'DISPENSE', tone: 'green' },
] as const

/** Control-section headings on the deck. */
export const SECTIONS = {
  reference: { title: 'REFERENCE GEOMETRY', code: 'IN-01' },
  material: { title: 'MATERIAL', code: 'MT-02' },
  inflation: { title: 'INFLATION', code: 'IF-03' },
  scene: { title: 'SCENE / ENVIRONMENT', code: 'SC-04' },
} as const

/** Inflation control labels — machine metaphors from handoff §13. */
export const INFLATION_CONTROLS = {
  puffiness: { label: 'AIR PRESSURE', low: 'FLAT', high: 'PUFFED' },
  asymmetry: { label: 'DEFORMATION', low: 'PERFECT', high: 'ORGANIC' },
  foldDensity: { label: 'CREASE DENSITY', low: 'SMOOTH', high: 'FOLDED' },
  gloss: { label: 'SURFACE REFLECTION', low: 'MATTE', high: 'GLOSSY' },
} as const

/** Dispenser copy for both locked and online states (handoff §18). */
export const DISPENSER_COPY = {
  offlineTitle: 'DISPENSER OFFLINE',
  offlineBody: ['COMPLETE A MATERIALIZATION', 'TO ACTIVATE RETRIEVAL'],
  onlineTitle: 'DISPENSER ONLINE',
  onlineBody: ['OBJECT READY FOR RETRIEVAL'],
  retrievedTitle: 'OBJECT RETRIEVED',
  slotLabel: 'OBJECT DISPENSER',
} as const
