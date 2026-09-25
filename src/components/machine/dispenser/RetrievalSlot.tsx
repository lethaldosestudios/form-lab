import type { ReactNode } from 'react'

interface RetrievalSlotProps {
  children?: ReactNode
  /** Slot is lit/primed when the dispenser is online. */
  primed?: boolean
  label?: string
}

/**
 * The retrieval compartment / object tray at the bottom of the machine
 * (handoff §18–20). Hosts the finished object once retrieved.
 */
export function RetrievalSlot({ children, primed = false, label = 'OBJECT DISPENSER' }: RetrievalSlotProps) {
  return (
    <div className="retrieval" data-primed={primed || undefined}>
      <span className="retrieval__label">{label}</span>
      <div className="retrieval__flap" aria-hidden="true" />
      <div className="retrieval__tray">
        {children ?? (
          <span className="retrieval__empty" aria-hidden="true">
            <span className="retrieval__empty-line" />
          </span>
        )}
      </div>
    </div>
  )
}
