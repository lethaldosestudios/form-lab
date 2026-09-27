import { createProceduralEngine, proceduralEngine } from '../engine/proceduralEngine'
import type { MachineStatus } from '../state/machineState'
import { useMachineStore } from '../state/machineStore'
import type { MachineParams } from '../state/params'
import { toGenerationParams } from '../state/useFabrication'

/**
 * Dev-only bridge for the screenshot harness (tools/screenshot.mjs).
 *
 * Exposes the machine store plus a couple of helpers so Playwright can force
 * the machine into any state deterministically — driving the full journey
 * through the UI would be slow and flaky. Never installed in production.
 */

const previewEngine = createProceduralEngine({ sdfRes: 72, counts: { x: 30, y: 30, z: 18 } })

export interface FormLabDevApi {
  setStatus: (
    status: MachineStatus,
    extra?: { hasReference?: boolean; retrievalCount?: number },
  ) => void
  setParams: (partial: Partial<MachineParams>) => void
  /** Generate an object and install it (full = final render, preview = low-res). */
  makeObject: (kind?: 'preview' | 'full') => Promise<string>
  clear: () => void
}

export function installDevBridge(): void {
  const api: FormLabDevApi = {
    setStatus(status, extra) {
      const { machine } = useMachineStore.getState()
      useMachineStore.setState({
        machine: {
          ...machine,
          status,
          hasReference: extra?.hasReference ?? status !== 'IDLE',
          retrievalCount: extra?.retrievalCount ?? machine.retrievalCount,
        },
      })
    },
    setParams(partial) {
      const { params } = useMachineStore.getState()
      useMachineStore.setState({ params: { ...params, ...partial } })
    },
    async makeObject(kind = 'full') {
      const { params, contour, holes } = useMachineStore.getState()
      const engine = kind === 'preview' ? previewEngine : proceduralEngine
      const object = await engine.generate(toGenerationParams(params, contour, holes))
      useMachineStore.setState(kind === 'preview' ? { previewObject: object } : { object })
      return object.id
    },
    clear() {
      useMachineStore.setState({ object: null, previewObject: null })
    },
  }

  ;(window as unknown as { __FORMLAB__?: FormLabDevApi }).__FORMLAB__ = api
}
