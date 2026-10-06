interface SelectorOption<T extends string> {
  value: T
  label: string
}

interface SelectorSwitchProps<T extends string> {
  label: string
  options: readonly SelectorOption<T>[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  variant?: 'default' | 'frosted'
}

/**
 * A discrete rotary selector presented as detented positions (handoff §6).
 * Used for material / background / transparency. Exposed as a radiogroup.
 */
export function SelectorSwitch<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  variant = 'default',
}: SelectorSwitchProps<T>) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )

  return (
    <div className={`selector selector--${variant}`} data-disabled={disabled || undefined}>
      <span className="selector__label">{label}</span>
      <div className="selector__rail" role="radiogroup" aria-label={label}>
        <span
          className="selector__pointer"
          aria-hidden="true"
          style={{ left: `${((activeIndex + 0.5) / options.length) * 100}%` }}
        />
        <span className="selector__scale" aria-hidden="true">
          {options.map((option, index) => (
            <span key={option.value} className="selector__mark">
              <span className="selector__mark-tick" />
              <span className="selector__mark-num">{index + 1}</span>
            </span>
          ))}
        </span>
        <div className="selector__options">
          {options.map((option, index) => {
            const selected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                tabIndex={selected ? 0 : -1}
                aria-checked={selected}
                aria-label={option.label}
                disabled={disabled}
                className="selector__option"
                data-selected={selected || undefined}
                onClick={() => onChange(option.value)}
                onKeyDown={(event) => {
                  let next = index
                  if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
                    next = (index + 1) % options.length
                  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
                    next = (index + options.length - 1) % options.length
                  else if (event.key === 'Home') next = 0
                  else if (event.key === 'End') next = options.length - 1
                  else return
                  event.preventDefault()
                  onChange(options[next].value)
                  const buttons =
                    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                      '[role="radio"]',
                    )
                  buttons?.[next]?.focus()
                }}
              >
                {variant === 'frosted' && option.value === 'translucent' ? 'TRANSL.' : option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
