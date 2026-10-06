import { useEffect } from 'react'
import { createProceduralEngine } from '../engine/proceduralEngine'
import type { GenerationEngine } from '../engine/types'
import { useMachineStore } from './machineStore'
import { toGenerationParams } from './useFabrication'

const previewEngine = createProceduralEngine({ sdfRes: 72, counts: { x: 30, y: 30, z: 18 } })
const EDITABLE = ['REFERENCE_LOADED', 'CONFIGURING', 'PREVIEWING', 'READY']

/** Canonical revision invalidates a job immediately, including the debounce gap. */
export function useLivePreview(engine: GenerationEngine = previewEngine) {
  const revision = useMachineStore((s) => s.generationRevision)
  useEffect(() => {
    let cancelled = false
    const current = () =>
      !cancelled &&
      useMachineStore.getState().generationRevision === revision &&
      EDITABLE.includes(useMachineStore.getState().machine.status)
    if (!current()) return
    const timer = setTimeout(async () => {
      if (!current()) return
      const store = useMachineStore.getState()
      if (!store.livePreview) {
        store.setPreviewStatus('empty')
        store.dispatch({ type: 'MARK_READY' })
        return
      }
      store.setPreviewStatus('pending')
      store.dispatch({ type: 'PREVIEW_START' })
      try {
        const object = await engine.generate(
          toGenerationParams(store.params, store.contour, store.holes),
        )
        if (!current() || !useMachineStore.getState().livePreview) return
        store.setPreviewObject(object)
        store.setPreviewStatus('current')
      } catch {
        if (!current()) return
        store.setPreviewStatus('failed')
      }
      if (!current()) return
      store.dispatch({ type: 'PREVIEW_END' })
      store.dispatch({ type: 'MARK_READY' })
    }, 450)
    return () => {
      cancelled = true
      clearTimeout(timer)
      engine.cancel?.()
    }
  }, [revision, engine])
}
