interface AnalogGaugeProps {
  label: string
  low: string
  high: string
  /** Normalized 0–1 reading. */
  value: number
  className?: string
}

const CX = 100
const CY = 95
const R = 70
const START = 135
const SWEEP = 270
const TICK_COUNT = 10

function polar(angle: number, radius: number) {
  const a = (angle * Math.PI) / 180
  return { x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a) }
}

function arcPath(fromAngle: number, toAngle: number, radius: number) {
  const p0 = polar(fromAngle, radius)
  const p1 = polar(toAngle, radius)
  const largeArc = toAngle - fromAngle > 180 ? 1 : 0
  return `M ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${largeArc} 1 ${p1.x} ${p1.y}`
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/**
 * A single believable physical gauge (handoff §8). Only a small number of
 * these exist, each with a real machine purpose — puffiness maps to AIR
 * PRESSURE. Exposed to assistive tech as a `meter`.
 */
export function AnalogGauge({ label, low, high, value, className }: AnalogGaugeProps) {
  const reading = clamp01(value)
  const needleAngle = START + reading * SWEEP
  const needleTip = polar(needleAngle, R - 14)
  const needleTail = polar(needleAngle + 180, 12)

  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => {
    const angle = START + (i / TICK_COUNT) * SWEEP
    const major = i % 2 === 0
    const outer = polar(angle, R - 8)
    const inner = polar(angle, R - (major ? 20 : 15))
    return { key: i, major, outer, inner }
  })

  const lowPoint = polar(START + 8, R - 26)
  const highPoint = polar(START + SWEEP - 8, R - 26)

  return (
    <figure className={['gauge', className].filter(Boolean).join(' ')}>
      <figcaption className="gauge__label">{label}</figcaption>
      <svg
        className="gauge__dial"
        viewBox="0 0 200 165"
        role="meter"
        aria-label={`${label} gauge`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(reading * 100)}
      >
        <defs>
          <radialGradient id="gauge-face" cx="50%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#20242a" />
            <stop offset="100%" stopColor="#0d0f12" />
          </radialGradient>
          <linearGradient id="gauge-needle" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f0503c" />
            <stop offset="100%" stopColor="#ff8b7a" />
          </linearGradient>
        </defs>

        <path className="gauge__track" d={arcPath(START, START + SWEEP, R)} />
        <path
          className="gauge__arc"
          d={arcPath(START, START + SWEEP, R - 5)}
          strokeDasharray={`${reading * Math.PI * (R - 5) * (SWEEP / 360) * 2} 9999`}
        />

        {ticks.map((tick) => (
          <line
            key={tick.key}
            className={tick.major ? 'gauge__tick gauge__tick--major' : 'gauge__tick'}
            x1={tick.inner.x}
            y1={tick.inner.y}
            x2={tick.outer.x}
            y2={tick.outer.y}
          />
        ))}

        <text className="gauge__scale" x={lowPoint.x} y={lowPoint.y} textAnchor="middle">
          {low}
        </text>
        <text className="gauge__scale" x={highPoint.x} y={highPoint.y} textAnchor="middle">
          {high}
        </text>

        <line
          className="gauge__needle"
          x1={needleTail.x}
          y1={needleTail.y}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="url(#gauge-needle)"
        />
        <circle className="gauge__hub" cx={CX} cy={CY} r={9} />
        <circle className="gauge__hub-cap" cx={CX} cy={CY} r={4} />
      </svg>
    </figure>
  )
}
