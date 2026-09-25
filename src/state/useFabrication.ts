import { useCallback, useRef } from 'react'

import { proceduralEngine } from '../engine/proceduralEngine'
import type { GenerationEngine, GenerationParams, Vec2 } from '../engine/types'
import { canMaterializeNow } from './machineState'
import { useMachineStore } from './machineStore'
import type { MachineParams } from './params'

/** Translate UI parameters + the active contour into engine input. */
export function toGenerationParams(params: MachineParams, contour: Vec2[]): GenerationParams {
  return {
    silhouetteContour: contour,
    material: params.material,
    color: params.color,
    transparency: params.transparency,
    puffiness: params.puffiness,
    foldDensity: params.foldDensity,
    asymmetry: params.asymmetry,
    gloss: params.gloss,
    background: params.background,
    lighting: params.lighting,
    shadows: params.shadows,
  }
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

/** Minimum visible fabrication time so the CRT sequence always reads. */
const MIN_FABRICATION_MS = 1500
/** Beat between MATERIALIZE and RENDER_START, while the CRT runs its sequence. */
const GEOMETRY_BEAT_MS = 520

/**
 * Drives the MATERIALIZE flow: advances the machine state, runs the engine and
 * lands the result in the CRT (handoff §15, §16). Cancellation/supersession for
 * debounced live preview is layered on top of this in the live-preview phase.
 */
export function useFabrication(engine: GenerationEngine = proceduralEngine) {
  const running = useRef(false)

  const materialize = useCallback(async () => {
    if (running.current) return
    const store = useMachineStore.getState()
    if (!canMaterializeNow(store.machine)) return

    running.current = true
    const started = now()
    const params = toGenerationParams(store.params, store.contour)

    store.dispatch({ type: 'MATERIALIZE' })
    await wait(GEOMETRY_BEAT_MS)
    store.dispatch({ type: 'RENDER_START' })

    try {
      const object = await engine.generate(params)
      const elapsed = now() - started
      if (elapsed < MIN_FABRICATION_MS) await wait(MIN_FABRICATION_MS - elapsed)
      store.setObject(object)
      store.dispatch({ type: 'GENERATION_COMPLETE', objectId: object.id })
    } catch (error) {
      store.dispatch({ type: 'GENERATION_FAILED', message: (error as Error).message })
    } finally {
      running.current = false
    }
  }, [engine])

  return { materialize }
}
