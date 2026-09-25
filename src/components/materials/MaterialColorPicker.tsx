import { useState, type ChangeEvent } from 'react'

import { COLOR_PRESETS } from '../../data/materialPresets'

interface MaterialColorPickerProps {
  value: string
  onChange: (hex: string) => void
  disabled?: boolean
}

const MAX_RECENT = 5

/**
 * Compact but prominent material color control (handoff §11): swatch + hex,
 * a RECENT strip and named PRESETS. Selection takes effect immediately.
 */
export function MaterialColorPicker({ value, onChange, disabled = false }: MaterialColorPickerProps) {
  const [recent, setRecent] = useState<string[]>([])

  const commit = (hex: string) => {
    const normalized = hex.toUpperCase()
    onChange(normalized)
    setRecent((prev) => [normalized, ...prev.filter((c) => c !== normalized)].slice(0, MAX_RECENT))
  }

  const handleNative = (event: ChangeEvent<HTMLInputElement>) => commit(event.target.value)

  return (
    <div className="color-picker">
      <div className="color-picker__row">
        <label className="color-picker__swatch" style={{ background: value }}>
          <input
            className="color-picker__input"
            type="color"
            value={value}
            disabled={disabled}
            onChange={handleNative}
            aria-label="Material color"
          />
          <span className="color-picker__swatch-gloss" aria-hidden="true" />
        </label>
        <span className="color-picker__hex">{value}</span>
      </div>

      {recent.length > 0 && (
        <div className="color-picker__recent">
          <span className="color-picker__caption">RECENT</span>
          <span className="color-picker__dots">
            {recent.map((hex) => (
              <button
                key={hex}
                type="button"
                className="color-picker__dot"
                style={{ background: hex }}
                onClick={() => commit(hex)}
                disabled={disabled}
                aria-label={`Recent color ${hex}`}
              />
            ))}
          </span>
        </div>
      )}

      <div className="color-picker__presets">
        <span className="color-picker__caption">PRESETS</span>
        <span className="color-picker__chips">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              className="color-picker__chip"
              data-selected={preset.value.toUpperCase() === value.toUpperCase() || undefined}
              onClick={() => commit(preset.value)}
              disabled={disabled}
            >
              <span className="color-picker__chip-dot" style={{ background: preset.value }} aria-hidden="true" />
              {preset.name}
            </button>
          ))}
        </span>
      </div>
    </div>
  )
}
