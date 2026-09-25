import type { ReactNode } from 'react'

import { Screw } from './Screw'

interface PanelProps {
  children: ReactNode
  className?: string
  /** Render fasteners in the panel corners. */
  screws?: boolean
  /** Mildly recessed (default) vs. raised sub-panel. */
  variant?: 'recessed' | 'raised'
  as?: 'section' | 'div' | 'article' | 'aside'
}

/**
 * A physical panel surface — the recurring building block of the machine
 * chassis. Recessed panels read as cut into the machine; raised panels read
 * as bolted on top (handoff §23).
 */
export function Panel({ children, className, screws = false, variant = 'recessed', as }: PanelProps) {
  const Tag = as ?? 'div'
  const classes = ['panel', `panel--${variant}`, className].filter(Boolean).join(' ')

  return (
    <Tag className={classes}>
      {children}
      {screws && (
        <>
          <Screw className="panel__screw panel__screw--tl" />
          <Screw className="panel__screw panel__screw--tr" />
          <Screw className="panel__screw panel__screw--bl" />
          <Screw className="panel__screw panel__screw--br" />
        </>
      )}
    </Tag>
  )
}
