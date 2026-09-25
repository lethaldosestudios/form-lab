/**
 * The physical CRT glass layer (handoff §5): convex sheen, vignette, very
 * subtle scanlines and a faint internal glow. Deliberately restrained — the
 * rendered object must remain clear. Purely decorative, so hidden from AT.
 */
export function CRTGlass() {
  return (
    <div className="crt__glass" aria-hidden="true">
      <div className="crt__scanlines" />
      <div className="crt__vignette" />
      <div className="crt__glow" />
      <div className="crt__reflection" />
      <div className="crt__edge" />
    </div>
  )
}
