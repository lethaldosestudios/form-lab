import { MATERIAL_BY_ID, MATERIAL_PRESETS, type MaterialKey } from '../../data/materialPresets'
import { MaterialCartridge } from './MaterialCartridge'

interface MaterialSelectorProps {
  value: MaterialKey
  onChange: (id: MaterialKey) => void
  disabled?: boolean
}

/**
 * The material cartridge bay (handoff §10). A physical slot shows the loaded
 * cartridge; the rail lets the user insert another. Exposed as a radiogroup.
 */
export function MaterialSelector({ value, onChange, disabled = false }: MaterialSelectorProps) {
  const loaded = MATERIAL_BY_ID[value]

  return (
    <div className="material-selector">
      <div className="material-selector__slot" aria-hidden="true">
        <span className="material-selector__slot-label">MATERIAL CARTRIDGE</span>
        <span className="material-selector__loaded" data-loaded={Boolean(loaded) || undefined}>
          <span className="material-selector__loaded-code">{loaded.code}</span>
        </span>
      </div>

      <div className="material-selector__rail" role="radiogroup" aria-label="Material">
        {MATERIAL_PRESETS.map((preset) => (
          <MaterialCartridge
            key={preset.id}
            preset={preset}
            selected={preset.id === value}
            onSelect={onChange}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}
