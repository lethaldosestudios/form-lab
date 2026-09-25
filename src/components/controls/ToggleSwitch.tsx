interface ToggleSwitchProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  /** Short helper text shown beneath ambiguous metaphors (handoff §25). */
  hint?: string
}

/**
 * A physical rocker/lever toggle for binary settings (handoff §6). Exposed as
 * a switch for assistive tech with a real text label (handoff §25).
 */
export function ToggleSwitch({ label, checked, onChange, disabled = false, hint }: ToggleSwitchProps) {
  return (
    <div className="toggle" data-disabled={disabled || undefined}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className="toggle__control"
        data-on={checked || undefined}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle__track">
          <span className="toggle__lever" />
        </span>
        <span className="toggle__label">{label}</span>
        <span className="toggle__state" aria-hidden="true">
          {checked ? 'ON' : 'OFF'}
        </span>
      </button>
      {hint && <span className="toggle__hint">{hint}</span>}
    </div>
  )
}
