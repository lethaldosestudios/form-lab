import { MATERIAL_PRESETS, type MaterialKey } from '../../data/materialPresets'
import { BrowseArrows } from '../controls/BrowseArrows'

export function MaterialSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: MaterialKey
  onChange: (id: MaterialKey) => void
  disabled?: boolean
}) {
  const index = MATERIAL_PRESETS.findIndex((preset) => preset.id === value)
  return (
    <BrowseArrows
      label="MATERIAL PRESETS"
      previousDisabled={disabled || index <= 0}
      nextDisabled={disabled || index >= MATERIAL_PRESETS.length - 1}
      onPrevious={() => onChange(MATERIAL_PRESETS[Math.max(0, index - 1)].id)}
      onNext={() => onChange(MATERIAL_PRESETS[Math.min(MATERIAL_PRESETS.length - 1, index + 1)].id)}
    />
  )
}
