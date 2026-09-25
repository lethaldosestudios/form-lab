import { INDICATORS } from '../../data/machineConfig'
import type { IndicatorStates } from '../../state/indicators'

interface StatusLightsProps {
  states: IndicatorStates
  className?: string
}

/**
 * The bank of machine indicator bulbs. Colors carry functional meaning
 * (handoff §7 / §22), not decoration. Status is never conveyed by color
 * alone — each bulb has a text label and an aria state.
 */
export function StatusLights({ states, className }: StatusLightsProps) {
  return (
    <ul className={['status-lights', className].filter(Boolean).join(' ')}>
      {INDICATORS.map((indicator) => {
        const state = states[indicator.id]
        const lit = state !== 'off'
        return (
          <li
            key={indicator.id}
            className="status-lights__row"
            data-state={state}
            data-tone={indicator.tone}
          >
            <span className="status-lights__label">{indicator.label}</span>
            <span
              className="indicator"
              data-state={state}
              data-tone={indicator.tone}
              role="img"
              aria-label={`${indicator.label}: ${state}`}
            >
              <span className="indicator__lens" />
              {lit && state === 'processing' && <span className="indicator__pulse" />}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
