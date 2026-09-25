/** Decorative ventilation slots (handoff §23). */
export function Vents({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <span className={['vents', className].filter(Boolean).join(' ')} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="vents__slot" />
      ))}
    </span>
  )
}
