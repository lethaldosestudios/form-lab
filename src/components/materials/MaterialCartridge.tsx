import type { MaterialKey, MaterialPreset } from '../../data/materialPresets'

interface MaterialCartridgeProps {
  preset: MaterialPreset
  selected: boolean
  onSelect: (id: MaterialKey) => void
  disabled?: boolean
}

/**
 * A single material cartridge (handoff §10). Selecting one "inserts" it into
 * the machine. Rendered as a radio within the material selector group.
 */
export function MaterialCartridge({ preset, selected, onSelect, disabled = false }: MaterialCartridgeProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${preset.name} (${preset.code})`}
      disabled={disabled}
      className="cartridge"
      data-selected={selected || undefined}
      onClick={() => onSelect(preset.id)}
    >
      <span className="cartridge__swatch" style={{ background: preset.color }} aria-hidden="true" />
      <span className="cartridge__meta">
        <span className="cartridge__name">{preset.name}</span>
        <span className="cartridge__code">{preset.code}</span>
      </span>
    </button>
  )
}
