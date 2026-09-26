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
 * The CRT as a physical instrument module bolted into the machine (handoff §5,
 * plan §4/§P0.1). Not a screen placed in a layout: an outer housing with a
 * projecting hood, a thick stepped bezel with its own fasteners, smoked convex
 * glass, and an underhang that casts a shadow onto the chassis.
 *
 * Projection is achieved with layered shading and chamfers — never a 3D
 * transform, which would distort the WebGL canvas inside `.crt__screen`.
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
        <span className="crt__hood" aria-hidden="true" />

        <Screw className="crt__screw crt__screw--tl" />
        <Screw className="crt__screw crt__screw--tr" />
        <Screw className="crt__screw crt__screw--bl" />
        <Screw className="crt__screw crt__screw--br" />

        <div className="crt__bezel">
          <Screw className="crt__bezel-screw crt__bezel-screw--tl" />
          <Screw className="crt__bezel-screw crt__bezel-screw--tr" />
          <Screw className="crt__bezel-screw crt__bezel-screw--bl" />
          <Screw className="crt__bezel-screw crt__bezel-screw--br" />

          <div className="crt__screen">
            <div className="crt__content" role="status" aria-live="polite" aria-atomic="false">
              {children}
            </div>
            <CRTGlass />
          </div>
        </div>

        <span className="crt__underhang" aria-hidden="true" />
        <Vents count={7} className="crt__vents" />
      </div>

      <div className="crt__plate">
        <span className="crt__plate-label">{label}</span>
        <span className="crt__plate-model">{model}</span>
      </div>
    </div>
  )
}
