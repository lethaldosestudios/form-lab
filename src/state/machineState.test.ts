import { describe, expect, it } from 'vitest'

import {
  INITIAL_MACHINE_STATE,
  machineReducer,
  type MachineEvent,
  type MachineState,
} from './machineState'

const run = (events: MachineEvent[], from: MachineState = INITIAL_MACHINE_STATE): MachineState =>
  events.reduce(machineReducer, from)

describe('machineReducer', () => {
  it('starts idle with no reference', () => {
    expect(INITIAL_MACHINE_STATE.status).toBe('IDLE')
    expect(INITIAL_MACHINE_STATE.hasReference).toBe(false)
  })

  it('walks the full happy path', () => {
    const state = run([
      { type: 'REFERENCE_SET' },
      { type: 'PARAMS_CHANGED' },
      { type: 'MARK_READY' },
      { type: 'MATERIALIZE' },
      { type: 'RENDER_START' },
      { type: 'GENERATION_COMPLETE', objectId: 'obj-1' },
      { type: 'DISPENSER_VIEW' },
      { type: 'RETRIEVE' },
      { type: 'RETRIEVE_COMPLETE' },
    ])

    expect(state.status).toBe('RETRIEVED')
    expect(state.objectId).toBe('obj-1')
    expect(state.retrievalCount).toBe(1)
  })

  it('loads a reference from idle', () => {
    const state = run([{ type: 'REFERENCE_SET' }])
    expect(state.status).toBe('REFERENCE_LOADED')
    expect(state.hasReference).toBe(true)
  })

  it('ignores PARAMS_CHANGED while idle (no reference yet)', () => {
    const state = run([{ type: 'PARAMS_CHANGED' }])
    expect(state.status).toBe('IDLE')
  })

  it('invalidates a completed object when parameters change', () => {
    const state = run(
      [{ type: 'PARAMS_CHANGED' }],
      {
        ...INITIAL_MACHINE_STATE,
        status: 'OBJECT_READY',
        hasReference: true,
        objectId: 'obj-1',
      },
    )
    expect(state.status).toBe('CONFIGURING')
    expect(state.objectId).toBeNull()
  })

  it('rejects MATERIALIZE from idle', () => {
    const state = run([{ type: 'MATERIALIZE' }])
    expect(state.status).toBe('IDLE')
  })

  it('rejects RENDER_START unless materializing', () => {
    expect(run([{ type: 'RENDER_START' }]).status).toBe('IDLE')
    const materializing = run([{ type: 'REFERENCE_SET' }, { type: 'MATERIALIZE' }])
    expect(materializing.status).toBe('MATERIALIZING')
    expect(machineReducer(materializing, { type: 'RENDER_START' }).status).toBe('RENDERING')
  })

  it('rejects GENERATION_COMPLETE unless rendering', () => {
    const materializing = run([{ type: 'REFERENCE_SET' }, { type: 'MATERIALIZE' }])
    expect(
      machineReducer(materializing, { type: 'GENERATION_COMPLETE', objectId: 'x' }).status,
    ).toBe('MATERIALIZING')
  })

  it('ignores reference edits while busy', () => {
    const rendering = run([
      { type: 'REFERENCE_SET' },
      { type: 'MATERIALIZE' },
      { type: 'RENDER_START' },
    ])
    expect(rendering.status).toBe('RENDERING')
    expect(machineReducer(rendering, { type: 'REFERENCE_SET' }).status).toBe('RENDERING')
    expect(machineReducer(rendering, { type: 'REFERENCE_CLEARED' }).status).toBe('RENDERING')
  })

  it('only enters PREVIEWING from CONFIGURING', () => {
    expect(run([{ type: 'PREVIEW_START' }]).status).toBe('IDLE')
    const configuring = run([{ type: 'REFERENCE_SET' }, { type: 'PARAMS_CHANGED' }])
    expect(machineReducer(configuring, { type: 'PREVIEW_START' }).status).toBe('PREVIEWING')
    expect(machineReducer(configuring, { type: 'PREVIEW_END' }).status).toBe('CONFIGURING')
  })

  it('handles generation failure and recovery', () => {
    const rendering = run([
      { type: 'REFERENCE_SET' },
      { type: 'MATERIALIZE' },
      { type: 'RENDER_START' },
    ])
    const failed = machineReducer(rendering, { type: 'GENERATION_FAILED', message: 'boom' })
    expect(failed.status).toBe('ERROR')
    expect(failed.error).toBe('boom')
    expect(machineReducer(failed, { type: 'DISMISS_ERROR' }).status).toBe('REFERENCE_LOADED')
  })

  it('dismisses error to IDLE when there is no reference', () => {
    const errored: MachineState = { ...INITIAL_MACHINE_STATE, status: 'ERROR', error: 'x' }
    expect(machineReducer(errored, { type: 'DISMISS_ERROR' }).status).toBe('IDLE')
  })

  it('resets to idle but preserves retrieval count', () => {
    const state = run(
      [{ type: 'RESET' }],
      { ...INITIAL_MACHINE_STATE, status: 'RETRIEVED', retrievalCount: 3, hasReference: true },
    )
    expect(state.status).toBe('IDLE')
    expect(state.retrievalCount).toBe(3)
    expect(state.hasReference).toBe(false)
  })

  it('starts a new object from a retrieved state', () => {
    const retrieved: MachineState = {
      ...INITIAL_MACHINE_STATE,
      status: 'RETRIEVED',
      hasReference: true,
      retrievalCount: 1,
    }
    expect(machineReducer(retrieved, { type: 'NEW_OBJECT' }).status).toBe('CONFIGURING')
  })
})
