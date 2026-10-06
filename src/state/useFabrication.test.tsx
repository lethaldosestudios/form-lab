import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useFabrication } from './useFabrication'
import { useMachineStore } from './machineStore'
import type { RenderedObject } from '../engine/types'
beforeEach(() => {
  vi.useFakeTimers()
  useMachineStore.setState(useMachineStore.getInitialState(), true)
  useMachineStore.getState().setReference('blob:ref', 'REF')
  useMachineStore.getState().dispatch({ type: 'MARK_READY' })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
it('cannot install a fabrication result after service reset', async () => {
  let resolve!: (object: RenderedObject) => void
  const engine = {
    generate: vi.fn(
      () =>
        new Promise<RenderedObject>((r) => {
          resolve = r
        }),
    ),
  }
  const { result } = renderHook(() => useFabrication(engine))
  let job!: Promise<void>
  act(() => {
    job = result.current.materialize()
  })
  await act(() => vi.advanceTimersByTimeAsync(520))
  act(() => useMachineStore.getState().resetUnit())
  await act(async () => {
    resolve({ id: 'obsolete', preview: 'data:,', descriptor: { kind: 'image', dataURL: 'data:,' } })
    await vi.advanceTimersByTimeAsync(1500)
    await job
  })
  expect(useMachineStore.getState().object).toBeNull()
  expect(useMachineStore.getState().machine.status).toBe('IDLE')
})
it('rejects illegal make-another without invalidating the active job', () => {
  useMachineStore.getState().dispatch({ type: 'MATERIALIZE' })
  const revision = useMachineStore.getState().generationRevision
  useMachineStore.getState().makeAnother()
  expect(useMachineStore.getState().generationRevision).toBe(revision)
  expect(useMachineStore.getState().machine.status).toBe('MATERIALIZING')
})
