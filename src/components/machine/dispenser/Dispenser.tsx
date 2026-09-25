import type { ReactNode } from 'react'
import { motion } from 'motion/react'

import { PushButton } from '../../controls/PushButton'
import { DISPENSER_COPY } from '../../../data/machineConfig'
import { RetrievalSlot } from './RetrievalSlot'

export type DispenserMode = 'offline' | 'online' | 'retrieved'

interface DispenserProps {
  mode?: DispenserMode
  /** Rendered object (thumbnail / canvas) once available. */
  objectSlot?: ReactNode
  onRetrieve?: () => void
  /** Show a skip affordance after the first theatrical retrieval (handoff §19). */
  skippable?: boolean
  onSkip?: () => void
  onDownload?: () => void
  onView?: () => void
  onMakeAnother?: () => void
}

/**
 * The lower fabrication/dispenser section (handoff §18–20). Locked until a
 * materialization completes, then primed for retrieval. The retrieval
 * animation is theatrical the first time and skippable thereafter.
 */
export function Dispenser({
  mode = 'offline',
  objectSlot,
  onRetrieve,
  skippable = false,
  onSkip,
  onDownload,
  onView,
  onMakeAnother,
}: DispenserProps) {
  const online = mode === 'online' || mode === 'retrieved'
  const retrieved = mode === 'retrieved'

  const title = retrieved
    ? DISPENSER_COPY.retrievedTitle
    : online
      ? DISPENSER_COPY.onlineTitle
      : DISPENSER_COPY.offlineTitle

  const body = retrieved
    ? []
    : online
      ? DISPENSER_COPY.onlineBody
      : DISPENSER_COPY.offlineBody

  return (
    <section className="dispenser" aria-label="Object dispenser">
      <header className="dispenser__header">
        <span className="dispenser__title" data-online={online || undefined}>
          {title}
        </span>
        <span className="dispenser__status" aria-hidden="true">
          {online ? '● ONLINE' : '○ OFFLINE'}
        </span>
      </header>

      <div className="dispenser__body">
        {body.length > 0 && (
          <div className="dispenser__copy">
            {body.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        )}

        <RetrievalSlot primed={online}>
          {retrieved && objectSlot ? (
            <motion.div
              className="retrieval__drop"
              initial={{ y: -80, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 110, damping: 16 }}
            >
              {objectSlot}
            </motion.div>
          ) : undefined}
        </RetrievalSlot>

        <div className="dispenser__actions">
          {retrieved ? (
            <>
              <PushButton variant="secondary" onClick={onDownload}>
                DOWNLOAD
              </PushButton>
              <PushButton variant="secondary" onClick={onView}>
                VIEW
              </PushButton>
              <PushButton variant="ghost" onClick={onMakeAnother}>
                MAKE ANOTHER
              </PushButton>
            </>
          ) : (
            <>
              <PushButton
                variant="primary"
                size="lg"
                beam={online}
                active={online}
                disabled={!online}
                onClick={onRetrieve}
              >
                RETRIEVE OBJECT
              </PushButton>
              {skippable && (
                <PushButton variant="ghost" onClick={onSkip}>
                  SKIP ANIMATION
                </PushButton>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
