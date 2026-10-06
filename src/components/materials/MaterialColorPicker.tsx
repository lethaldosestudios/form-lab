import { COLOR_PRESETS } from '../../data/materialPresets'
import { BrowseArrows } from '../controls/BrowseArrows'

export function MaterialColorPicker({
  value,
  onChange,
  onEdit,
  disabled = false,
}: {
  value: string
  onChange: (hex: string) => void
  onEdit: () => void
  disabled?: boolean
}) {
  const index = COLOR_PRESETS.findIndex(
    (preset) => preset.value.toUpperCase() === value.toUpperCase(),
  )
  return (
    <div className="color-browser">
      <BrowseArrows
        label="COLORS"
        previousDisabled={disabled || index === 0}
        nextDisabled={disabled || index === COLOR_PRESETS.length - 1}
        onPrevious={() =>
          onChange(
            COLOR_PRESETS[index < 0 ? COLOR_PRESETS.length - 1 : Math.max(0, index - 1)].value,
          )
        }
        onNext={() =>
          onChange(
            COLOR_PRESETS[index < 0 ? 0 : Math.min(COLOR_PRESETS.length - 1, index + 1)].value,
          )
        }
      />
      <button
        id="color-edit-key"
        type="button"
        className="frosted-key"
        disabled={disabled}
        onClick={onEdit}
      >
        EDIT
      </button>
    </div>
  )
}
