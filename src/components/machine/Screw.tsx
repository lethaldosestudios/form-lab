/** A single panel screw / fastener (handoff §23). Purely decorative. */
export function Screw({ className }: { className?: string }) {
  return <span className={['screw', className].filter(Boolean).join(' ')} aria-hidden="true" />
}
