import { useEffect, useRef } from 'react'

import { createProceduralEngine } from '../engine/proceduralEngine'
import type { MachineStatus } from './machineState'
import { useMachineStore } from './machineStore'
import { toGenerationParams } from './useFabrication'

/** Low-resolution engine reserved for the responsive preview (handoff §14). */
const previewEngine = createProceduralEngine({ sdfRes: 72, counts: { x: 30, y: 30, z: 18 } })

/** Wait this long after the last edit before previewing. */
const DEBOUNCE_MS = 450

const EDITABLE: readonly MachineStatus[] = [
  'REFERENCE_LOADED',
  'CONFIGURING',
  'PREVIEWING',
  'READY',
]

/**
 * Layer 1 live preview (handoff §14, engineering spec §2 #7). Debounced,
 * low-resolution, and superseded on every new edit — never one heavy
 * generation per slider tick. When LIVE PREVIEW is off, edits simply settle
 * the machine into READY for a manual MATERIALIZE.
 */
export function useLivePreview() {
  const params = useMachineStore((s) => s.params)
  const contour = useMachineStore((s) => s.contour)
  const livePreview = useMachineStore((s) => s.livePreview)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const token = useRef(0)

  useEffect(() => {
    const status = useMachineStore.getState().machine.status
    if (!EDITABLE.includes(status)) return

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const store = useMachineStore.getState()
      if (!EDITABLE.includes(store.machine.status)) return

      if (!store.livePreview) {
        store.dispatch({ type: 'MARK_READY' })
        return
      }

      const id = ++token.current
      store.dispatch({ type: 'PREVIEW_START' })
      try {
        const object = await previewEngine.generate(toGenerationParams(store.params, store.contour))
        if (id !== token.current) return
        useMachineStore.getState().setPreviewObject(object)
      } catch {
        // Superseded or failed preview — leave the previous preview in place.
      }
      const after = useMachineStore.getState()
      after.dispatch({ type: 'PREVIEW_END' })
      after.dispatch({ type: 'MARK_READY' })
    }, DEBOUNCE_MS)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [params, contour, livePreview])
}
