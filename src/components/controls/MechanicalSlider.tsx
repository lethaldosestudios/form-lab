import { useCallback, useRef, type KeyboardEvent, type PointerEvent } from 'react'

import { clamp01 } from '../../lib/math'

interface MechanicalSliderProps {
  label: string
  /** Normalized 0–1 value. */
  value: number
  onChange: (value: number) => void
  low?: string
  high?: string
  disabled?: boolean
}

/**
 * A machined horizontal slider (handoff §6, §24). Drag the handle; keyboard
 * arrows nudge, PageUp/Down and Home/End jump. Exposed as a slider.
 */
export function MechanicalSlider({
  label,
  value,
  onChange,
  low,
  high,
  disabled = false,
}: MechanicalSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width === 0) return
      onChange(clamp01((clientX - rect.left) / rect.width))
    },
    [onChange],
  )

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    dragging.current = true
    trackRef.current?.setPointerCapture(event.pointerId)
    setFromClientX(event.clientX)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    setFromClientX(event.clientX)
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = false
    trackRef.current?.releasePointerCapture(event.pointerId)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const inc = event.shiftKey ? 0.01 : 0.05
    let handled = true
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        onChange(clamp01(value + inc))
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        onChange(clamp01(value - inc))
        break
      case 'PageUp':
        onChange(clamp01(value + 0.1))
        break
      case 'PageDown':
        onChange(clamp01(value - 0.1))
        break
      case 'Home':
        onChange(0)
        break
      case 'End':
        onChange(1)
        break
      default:
        handled = false
    }
    if (handled) event.preventDefault()
  }

  const reading = clamp01(value)

  return (
    <div className="slider" data-disabled={disabled || undefined}>
      <div className="slider__head">
        <span className="slider__label">{label}</span>
        <span className="slider__value" aria-hidden="true">
          {Math.round(reading * 100)}%
        </span>
      </div>
      <div
        ref={trackRef}
        className="slider__track"
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(reading * 100)}
        aria-valuetext={`${Math.round(reading * 100)}%`}
        aria-disabled={disabled || undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <span className="slider__rail" />
        <span className="slider__fill" style={{ width: `${reading * 100}%` }} />
        <span className="slider__handle" style={{ left: `${reading * 100}%` }}>
          <span className="slider__grip" />
        </span>
      </div>
      {(low || high) && (
        <div className="slider__ends">
          <span>{low}</span>
          <span>{high}</span>
        </div>
      )}
    </div>
  )
}
