import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_SILHOUETTE } from '../data/sampleSilhouettes'
import { useMachineStore } from './machineStore'

const resetStore = () => {
  useMachineStore.setState(useMachineStore.getInitialState(), true)
}

describe('machineStore', () => {
  beforeEach(resetStore)

  it('starts in the idle machine state with the default silhouette', () => {
    const state = useMachineStore.getState()
    expect(state.machine.status).toBe('IDLE')
    expect(state.contour).toBe(DEFAULT_SILHOUETTE.contour)
    expect(state.object).toBeNull()
  })

  it('moves to REFERENCE_LOADED when a reference is set', () => {
    useMachineStore.getState().setReference('blob:ref', 'SHAPE')
    expect(useMachineStore.getState().machine.status).toBe('REFERENCE_LOADED')
  })

  it('enters CONFIGURING when a parameter changes after a reference', () => {
    const store = useMachineStore.getState()
    store.setReference('blob:ref', 'SHAPE')
    useMachineStore.getState().updateParam('puffiness', 0.9)
    expect(useMachineStore.getState().machine.status).toBe('CONFIGURING')
    expect(useMachineStore.getState().params.puffiness).toBe(0.9)
  })

  it('applies a material preset recipe (color + inflation defaults)', () => {
    const store = useMachineStore.getState()
    store.setReference('blob:ref', 'SHAPE')
    useMachineStore.getState().applyMaterial('chrome')

    const { params, machine } = useMachineStore.getState()
    expect(params.material).toBe('chrome')
    expect(params.color).toBe('#C9CDD2')
    expect(params.gloss).toBeGreaterThan(0.9)
    expect(machine.status).toBe('CONFIGURING')
  })

  it('clears a reference back to idle, restoring the default contour', () => {
    const store = useMachineStore.getState()
    store.setReference('blob:ref', 'SHAPE')
    useMachineStore.getState().setContour([{ x: 0, y: 0 }], 'REFERENCE')
    useMachineStore.getState().clearReference()

    const state = useMachineStore.getState()
    expect(state.machine.status).toBe('IDLE')
    expect(state.referenceUrl).toBeNull()
    expect(state.contour).toBe(DEFAULT_SILHOUETTE.contour)
  })

  it('makeAnother keeps the reference and clears the object', () => {
    useMachineStore.getState().setReference('blob:ref', 'SHAPE')
    useMachineStore.setState({
      machine: { ...useMachineStore.getState().machine, status: 'RETRIEVED' },
    })
    useMachineStore.getState().makeAnother()

    const state = useMachineStore.getState()
    expect(state.machine.status).toBe('CONFIGURING')
    expect(state.machine.hasReference).toBe(true)
    expect(state.object).toBeNull()
  })

  it('drops the live preview when the toggle is switched off', () => {
    useMachineStore.setState({
      previewObject: {
        id: 'preview',
        preview: 'data:,',
        descriptor: { kind: 'image', dataURL: 'data:,' },
      },
    })
    useMachineStore.getState().setLivePreview(false)
    expect(useMachineStore.getState().previewObject).toBeNull()
  })
})
