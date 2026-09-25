/**
 * FORM//LAB — machine state machine (handoff §30).
 *
 * One canonical `status` field rather than scattered booleans. Indicator
 * lights, CRT content and dispenser state all derive from this. Illegal
 * transitions are no-ops, which the unit tests assert.
 */

export type MachineStatus =
  | 'IDLE'
  | 'REFERENCE_LOADED'
  | 'CONFIGURING'
  | 'PREVIEWING'
  | 'READY'
  | 'MATERIALIZING'
  | 'RENDERING'
  | 'OBJECT_READY'
  | 'DISPENSER_READY'
  | 'RETRIEVING'
  | 'RETRIEVED'
  | 'ERROR'

export interface MachineState {
  status: MachineStatus
  /** True once a reference silhouette exists (drives config-vs-idle). */
  hasReference: boolean
  /** Id of the most recent rendered object, or null. */
  objectId: string | null
  /** Human-readable error, when in ERROR. */
  error: string | null
  /** Number of successful retrievals — drives first-run theatre (handoff §19). */
  retrievalCount: number
}

export const INITIAL_MACHINE_STATE: MachineState = {
  status: 'IDLE',
  hasReference: false,
  objectId: null,
  error: null,
  retrievalCount: 0,
}

export type MachineEvent =
  | { type: 'REFERENCE_SET' }
  | { type: 'REFERENCE_CLEARED' }
  | { type: 'PARAMS_CHANGED' }
  | { type: 'PREVIEW_START' }
  | { type: 'PREVIEW_END' }
  | { type: 'MARK_READY' }
  | { type: 'MATERIALIZE' }
  | { type: 'RENDER_START' }
  | { type: 'GENERATION_COMPLETE'; objectId: string }
  | { type: 'GENERATION_FAILED'; message: string }
  | { type: 'DISPENSER_VIEW' }
  | { type: 'RETRIEVE' }
  | { type: 'RETRIEVE_COMPLETE' }
  | { type: 'NEW_OBJECT' }
  | { type: 'RESET' }
  | { type: 'DISMISS_ERROR' }

const BUSY: readonly MachineStatus[] = ['MATERIALIZING', 'RENDERING', 'RETRIEVING']

const canEdit = (status: MachineStatus): boolean =>
  (
    [
      'REFERENCE_LOADED',
      'CONFIGURING',
      'PREVIEWING',
      'READY',
      'OBJECT_READY',
      'DISPENSER_READY',
      'RETRIEVED',
    ] as readonly MachineStatus[]
  ).includes(status)

const canMaterialize = (status: MachineStatus): boolean =>
  (
    [
      'REFERENCE_LOADED',
      'CONFIGURING',
      'READY',
      'OBJECT_READY',
      'DISPENSER_READY',
      'RETRIEVED',
    ] as readonly MachineStatus[]
  ).includes(status)

export function machineReducer(state: MachineState, event: MachineEvent): MachineState {
  const busy = BUSY.includes(state.status)

  switch (event.type) {
    case 'REFERENCE_SET':
      if (busy) return state
      return { ...state, status: 'REFERENCE_LOADED', hasReference: true, objectId: null, error: null }

    case 'REFERENCE_CLEARED':
      if (busy) return state
      return { ...INITIAL_MACHINE_STATE, retrievalCount: state.retrievalCount }

    case 'PARAMS_CHANGED':
      // Editing is only meaningful with a reference and while not busy; it
      // invalidates any completed object.
      if (!canEdit(state.status)) return state
      return { ...state, status: 'CONFIGURING', objectId: null, error: null }

    case 'PREVIEW_START':
      if (state.status !== 'CONFIGURING') return state
      return { ...state, status: 'PREVIEWING' }

    case 'PREVIEW_END':
      if (state.status !== 'PREVIEWING') return state
      return { ...state, status: 'CONFIGURING' }

    case 'MARK_READY':
      if (!canEdit(state.status) || state.status === 'OBJECT_READY') return state
      return { ...state, status: 'READY' }

    case 'MATERIALIZE':
      if (!canMaterialize(state.status)) return state
      return { ...state, status: 'MATERIALIZING', error: null }

    case 'RENDER_START':
      if (state.status !== 'MATERIALIZING') return state
      return { ...state, status: 'RENDERING' }

    case 'GENERATION_COMPLETE':
      if (state.status !== 'RENDERING') return state
      return { ...state, status: 'OBJECT_READY', objectId: event.objectId }

    case 'GENERATION_FAILED':
      if (state.status !== 'MATERIALIZING' && state.status !== 'RENDERING') return state
      return { ...state, status: 'ERROR', error: event.message }

    case 'DISPENSER_VIEW':
      if (state.status !== 'OBJECT_READY') return state
      return { ...state, status: 'DISPENSER_READY' }

    case 'RETRIEVE':
      if (state.status !== 'DISPENSER_READY' && state.status !== 'OBJECT_READY') return state
      return { ...state, status: 'RETRIEVING' }

    case 'RETRIEVE_COMPLETE':
      if (state.status !== 'RETRIEVING') return state
      return { ...state, status: 'RETRIEVED', retrievalCount: state.retrievalCount + 1 }

    case 'NEW_OBJECT':
      if (!canEdit(state.status)) return state
      return { ...state, status: 'CONFIGURING', objectId: null }

    case 'RESET':
      return { ...INITIAL_MACHINE_STATE, retrievalCount: state.retrievalCount }

    case 'DISMISS_ERROR':
      if (state.status !== 'ERROR') return state
      return {
        ...state,
        status: state.hasReference ? 'REFERENCE_LOADED' : 'IDLE',
        error: null,
      }

    default:
      return state
  }
}

/** Whether the primary MATERIALIZE action is currently available. */
export const canMaterializeNow = (state: MachineState): boolean => canMaterialize(state.status)

/** Whether the dispenser can be opened for retrieval. */
export const canRetrieveNow = (state: MachineState): boolean =>
  state.status === 'DISPENSER_READY' || state.status === 'OBJECT_READY'
