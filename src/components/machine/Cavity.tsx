import type { ReactNode } from 'react'

import { Screw } from './Screw'

interface CavityProps {
  children: ReactNode
  className?: string
  /** Fasteners set into the cavity rim. */
  screws?: boolean
  as?: 'section' | 'div' | 'article' | 'aside'
}

/**
 * L1 — a recessed cavity cut INTO the machine body (plan §3.1).
 *
 * Depth comes from the inset rim shadow and a beveled lip, never from an
 * outline. This is the physical explanation for the surface: material has been
 * removed from the chassis to seat a control assembly.
 */
export function Cavity({ children, className, screws = false, as }: CavityProps) {
  const Tag = as ?? 'div'
  return (
    <Tag className={['cavity', className].filter(Boolean).join(' ')}>
      {screws && (
        <>
          <Screw className="cavity__screw cavity__screw--tl" />
          <Screw className="cavity__screw cavity__screw--tr" />
          <Screw className="cavity__screw cavity__screw--bl" />
          <Screw className="cavity__screw cavity__screw--br" />
        </>
      )}
      <div className="cavity__floor">{children}</div>
    </Tag>
  )
}

interface SubPanelProps {
  children: ReactNode
  className?: string
  /** Fasteners bolting the plate into its cavity. */
  screws?: boolean
  as?: 'section' | 'div' | 'article' | 'aside'
}

/**
 * L2 — a sub-assembly plate bolted into a cavity (plan §3.1). Sits slightly
 * proud of the cavity floor so components can be mounted THROUGH it.
 */
export function SubPanel({ children, className, screws = false, as }: SubPanelProps) {
  const Tag = as ?? 'div'
  return (
    <Tag className={['sub-panel', className].filter(Boolean).join(' ')}>
      {screws && (
        <>
          <Screw className="sub-panel__screw sub-panel__screw--tl" />
          <Screw className="sub-panel__screw sub-panel__screw--tr" />
          <Screw className="sub-panel__screw sub-panel__screw--bl" />
          <Screw className="sub-panel__screw sub-panel__screw--br" />
        </>
      )}
      {children}
    </Tag>
  )
}
