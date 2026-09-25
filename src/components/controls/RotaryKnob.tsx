import { useCallback, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

import { clamp01 } from '../../lib/math'

const MIN_ANGLE = -135
const MAX_ANGLE = 135
const DRAG_RANGE_PX = 160

/** Physical identity — the knob's function decides its form (plan §4). */
export type KnobVariant = 'primary' | 'machined' | 'ribbed'

interface RotaryKnobProps {
  label: string
  /** Normalized 0–1 value. */
  value: number
  onChange: (value: number) => void
  variant?: KnobVariant
  disabled?: boolean
}

/**
 * A physical rotary knob mounted THROUGH the panel (handoff §6, plan §4).
 * Drag vertically to change the value; the dial rotates with mechanical ease.
 * Keyboard-operable and exposed as a slider for assistive tech (handoff §25).
 *
 * Variants give each control a manufactured identity:
 *  - `primary`  big chunky black plastic  → AIR PRESSURE
 *  - `machined` smaller aluminium         → DEFORMATION
 *  - `ribbed`   black ribbed / knurled    → SURFACE REFLECTION
 */
export function RotaryKnob({
  label,
  value,
  onChange,
  variant = 'primary',
  disabled = false,
}: RotaryKnobProps) {
  const drag = useRef<{ startY: number; startValue: number } | null>(null)
  const dialRef = useRef<HTMLDivElement>(null)

  const commit = useCallback((next: number) => onChange(clamp01(next)), [onChange])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    drag.current = { startY: event.clientY, startValue: value }
    dialRef.current?.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const dy = drag.current.startY - event.clientY
    commit(drag.current.startValue + dy / DRAG_RANGE_PX)
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = null
    dialRef.current?.releasePointerCapture(event.pointerId)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const inc = event.shiftKey ? 0.01 : 0.05
    let handled = true
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        commit(value + inc)
        break
      case 'ArrowDown':
      case 'ArrowLeft':
        commit(value - inc)
        break
      case 'PageUp':
        commit(value + 0.1)
        break
      case 'PageDown':
        commit(value - 0.1)
        break
      case 'Home':
        commit(0)
        break
      case 'End':
        commit(1)
        break
      default:
        handled = false
    }
    if (handled) event.preventDefault()
  }

  const reading = clamp01(value)
  const angle = MIN_ANGLE + reading * (MAX_ANGLE - MIN_ANGLE)
  const pct = Math.round(reading * 100)

  return (
    <div className={`knob knob--${variant}`} data-disabled={disabled || undefined}>
      <div
        ref={dialRef}
        className="knob__dial"
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${pct}%`}
        aria-disabled={disabled || undefined}
        style={{ '--knob-angle': `${angle}deg` } as CSSProperties}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <span className="knob__mount" aria-hidden="true" />
        <span className="knob__ticks" aria-hidden="true" />
        <span className="knob__body">
          <span className="knob__rim" aria-hidden="true" />
          <span className="knob__cap" aria-hidden="true">
            {variant === 'ribbed' && <span className="knob__ribs" />}
            <span className="knob__indicator" />
          </span>
        </span>
      </div>
      <span className="knob__value" aria-hidden="true">
        {pct}%
      </span>
    </div>
  )
}
