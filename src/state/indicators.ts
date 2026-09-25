import type { IndicatorId } from '../data/machineConfig'
import type { MachineStatus } from './machineState'

/**
 * Indicator bulb states (handoff §7).
 * - `off`        dark glass bulb
 * - `on`         illuminated, steady
 * - `processing` illuminated, pulsing
 * - `complete`   illuminated, steady (success)
 */
export type IndicatorState = 'off' | 'on' | 'processing' | 'complete'

export type IndicatorStates = Record<IndicatorId, IndicatorState>

const ALL_OFF: IndicatorStates = {
  power: 'on',
  reference: 'off',
  material: 'off',
  inflation: 'off',
  processing: 'off',
  ready: 'off',
  dispense: 'off',
}

/**
 * Derive the indicator bank purely from the machine status (handoff §7). This
 * keeps the status the single source of truth — the lights never hold their
 * own state.
 */
export function indicatorStatesFor(status: MachineStatus): IndicatorStates {
  switch (status) {
    case 'IDLE':
      return { ...ALL_OFF }
    case 'REFERENCE_LOADED':
      return { ...ALL_OFF, reference: 'on' }
    case 'CONFIGURING':
      return { ...ALL_OFF, reference: 'on', material: 'on', inflation: 'on' }
    case 'PREVIEWING':
      return { ...ALL_OFF, reference: 'on', material: 'on', inflation: 'on', processing: 'processing' }
    case 'READY':
      return { ...ALL_OFF, reference: 'on', material: 'on', inflation: 'on', ready: 'on' }
    case 'MATERIALIZING':
    case 'RENDERING':
      return {
        ...ALL_OFF,
        reference: 'on',
        material: 'on',
        inflation: 'on',
        processing: 'processing',
      }
    case 'OBJECT_READY':
      return {
        ...ALL_OFF,
        reference: 'on',
        material: 'on',
        inflation: 'on',
        processing: 'complete',
        ready: 'complete',
        dispense: 'on',
      }
    case 'DISPENSER_READY':
      return {
        ...ALL_OFF,
        reference: 'on',
        material: 'on',
        inflation: 'on',
        processing: 'complete',
        ready: 'complete',
        dispense: 'on',
      }
    case 'RETRIEVING':
      return {
        ...ALL_OFF,
        reference: 'on',
        material: 'on',
        inflation: 'on',
        processing: 'complete',
        ready: 'complete',
        dispense: 'processing',
      }
    case 'RETRIEVED':
      return {
        ...ALL_OFF,
        reference: 'on',
        material: 'on',
        inflation: 'on',
        processing: 'complete',
        ready: 'complete',
        dispense: 'complete',
      }
    case 'ERROR':
      return { ...ALL_OFF }
    default:
      return { ...ALL_OFF }
  }
}
