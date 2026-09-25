import { useCallback, useEffect, useRef } from 'react'

import { canRetrieveNow } from './machineState'
import { useMachineStore } from './machineStore'

/** Length of the theatrical retrieval animation (handoff §19). */
const THEATRICAL_MS = 2600
/** Reduced length when the user skips the animation. */
const SKIP_MS = 320

/**
 * Drives the RETRIEVE flow. The first retrieval is theatrical; the user can
 * skip it so the machine metaphor never becomes friction (handoff §19).
 */
export function useRetrieval() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const retrieve = useCallback((skip = false) => {
    const store = useMachineStore.getState()
    if (!canRetrieveNow(store.machine)) return
    store.dispatch({ type: 'RETRIEVE' })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(
      () => store.dispatch({ type: 'RETRIEVE_COMPLETE' }),
      skip ? SKIP_MS : THEATRICAL_MS,
    )
  }, [])

  return { retrieve }
}
