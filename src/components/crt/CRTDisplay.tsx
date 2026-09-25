import type { ReactNode } from 'react'

import { Screw } from '../machine/Screw'
import { Vents } from '../machine/Vents'
import { CRTGlass } from './CRTGlass'

interface CRTDisplayProps {
  children?: ReactNode
  /** Engraved nameplate text beneath the screen. */
  label?: string
  model?: string
  /** Faint phosphor tint for the screen; defaults to the token glow. */
  tint?: 'green' | 'blue' | 'neutral'
}

/**
 * The machine's central communication surface (handoff §5, §6). A thick convex
 * glass screen recessed into a dark bezel, with fasteners and a nameplate.
 * Screen *content* is supplied by the caller (see CRTState).
 */
export function CRTDisplay({
  children,
  label = 'DISPLAY / CRT',
  model = 'CRT-12 · 4:3',
  tint = 'green',
}: CRTDisplayProps) {
  return (
    <div className="crt" data-tint={tint}>
      <div className="crt__housing">
        <Screw className="crt__screw crt__screw--tl" />
        <Screw className="crt__screw crt__screw--tr" />
        <Screw className="crt__screw crt__screw--bl" />
        <Screw className="crt__screw crt__screw--br" />

        <div className="crt__bezel">
          <div className="crt__screen">
            <div className="crt__content" role="status" aria-live="polite" aria-atomic="false">
              {children}
            </div>
            <CRTGlass />
          </div>
        </div>

        <Vents count={7} className="crt__vents" />
      </div>

      <div className="crt__plate">
        <span className="crt__plate-label">{label}</span>
        <span className="crt__plate-model">{model}</span>
      </div>
    </div>
  )
}
