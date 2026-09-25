import type { ReactNode } from 'react'

interface MachineLabelProps {
  children: ReactNode
  /** Small technical code printed beside the label (e.g. "IN-01"). */
  code?: string
  tone?: 'primary' | 'muted' | 'technical'
  /** Section-heading styling (uppercase, tracked, engraved). */
  heading?: boolean
  htmlFor?: string
  as?: 'span' | 'div' | 'label' | 'h2' | 'h3'
  className?: string
}

/**
 * An engraved / printed technical label (handoff §23). Should read like
 * industrial labeling rather than decorative UI copy.
 */
export function MachineLabel({
  children,
  code,
  tone = 'technical',
  heading = false,
  htmlFor,
  as,
  className,
}: MachineLabelProps) {
  const Tag = as ?? 'span'
  const classes = [
    'm-label',
    `m-label--${tone}`,
    heading && 'm-label--heading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} htmlFor={htmlFor}>
      <span className="m-label__text">{children}</span>
      {code && <span className="m-label__code">{code}</span>}
    </Tag>
  )
}
