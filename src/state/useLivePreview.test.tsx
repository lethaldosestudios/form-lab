import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLivePreview } from './useLivePreview'
import { useMachineStore } from './machineStore'
import type { RenderedObject } from '../engine/types'
const object: RenderedObject = {
  id: 'current',
  preview: 'data:,',
  descriptor: { kind: 'image', dataURL: 'data:,' },
}
beforeEach(() => {
  vi.useFakeTimers()
  useMachineStore.setState(useMachineStore.getInitialState(), true)
  useMachineStore.getState().setReference('blob:ref', 'REF')
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
describe('preview revision routing', () => {
  it('rejects an old result during the next edit debounce gap', async () => {
    let resolve!: (o: RenderedObject) => void
    const engine = {
      generate: vi.fn(
        () =>
          new Promise<RenderedObject>((r) => {
            resolve = r
          }),
      ),
    }
    renderHook(() => useLivePreview(engine))
    await act(() => vi.advanceTimersByTimeAsync(450))
    act(() => useMachineStore.getState().updateParam('foldDensity', 0.9))
    await act(async () => resolve(object))
    expect(useMachineStore.getState().previewObject).toBeNull()
    expect(useMachineStore.getState().machine.status).toBe('CONFIGURING')
  })
  it.each(['reset', 'off'] as const)('rejects an in-flight result after %s', async (operation) => {
    let resolve!: (o: RenderedObject) => void
    const engine = {
      generate: () =>
        new Promise<RenderedObject>((r) => {
          resolve = r
        }),
    }
    renderHook(() => useLivePreview(engine))
    await act(() => vi.advanceTimersByTimeAsync(450))
    act(() =>
      operation === 'reset'
        ? useMachineStore.getState().resetUnit()
        : useMachineStore.getState().setLivePreview(false),
    )
    await act(async () => resolve(object))
    expect(useMachineStore.getState().previewObject).toBeNull()
    expect(useMachineStore.getState().previewStatus).toBe('empty')
  })
  it('marks the current preview ready and reports a failed preview without a stale object', async () => {
    const engine = { generate: vi.fn().mockResolvedValue(object) }
    renderHook(() => useLivePreview(engine))
    await act(() => vi.advanceTimersByTimeAsync(450))
    expect(useMachineStore.getState().previewObject).toBe(object)
    expect(useMachineStore.getState().machine.status).toBe('READY')
    engine.generate.mockRejectedValue(new Error('failed'))
    act(() => useMachineStore.getState().updateParam('puffiness', 0.3))
    await act(() => vi.advanceTimersByTimeAsync(450))
    expect(useMachineStore.getState().previewObject).toBeNull()
    expect(useMachineStore.getState().previewStatus).toBe('failed')
  })
})
