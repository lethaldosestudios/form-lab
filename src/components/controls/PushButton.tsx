import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface PushButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
  /** Renders a steady illuminated state (e.g. active/dispense). */
  active?: boolean
  /** Beam/edge accent reserved for the primary action (handoff §17). */
  beam?: boolean
}

/**
 * A physically pressable push button (handoff §6, §15). Large, tactile, with
 * a real text label and correct button semantics (handoff §25).
 */
export function PushButton({
  children,
  variant = 'secondary',
  size = 'md',
  active = false,
  beam = false,
  className,
  type = 'button',
  ...rest
}: PushButtonProps) {
  const classes = [
    'push-button',
    `push-button--${variant}`,
    `push-button--${size}`,
    beam && 'push-button--beam',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button {...rest} type={type} className={classes} data-active={active || undefined}>
      <span className="push-button__cap">
        <span className="push-button__label">{children}</span>
      </span>
    </button>
  )
}
