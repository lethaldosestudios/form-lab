import type { ReactNode } from 'react'

import { Vents } from './Vents'

/**
 * The outer industrial chassis (handoff §4, §22, §23). Dark painted metal with
 * a vented crown, panel breaks and rubber feet — establishes the machine's
 * physical scale and depth.
 */
export function MachineChassis({ children }: { children: ReactNode }) {
  return (
    <div className="chassis">
      <div className="chassis__crown" aria-hidden="true">
        <Vents count={14} className="chassis__crown-vents" />
      </div>

      <div className="chassis__shell">{children}</div>

      <div className="chassis__base" aria-hidden="true">
        <span className="chassis__foot" />
        <span className="chassis__foot" />
        <span className="chassis__foot" />
        <span className="chassis__foot" />
      </div>
    </div>
  )
}
