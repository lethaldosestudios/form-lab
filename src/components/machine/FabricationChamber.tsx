import { MachineLabel } from './MachineLabel'
import { Vents } from './Vents'
import type { MachineParams } from '../../state/params'
import type { MachineStatus } from '../../state/machineState'

const STAGE: Record<MachineStatus, string> = {
  IDLE: 'STANDBY',
  REFERENCE_LOADED: 'MEDIA LOCKED',
  CONFIGURING: 'CALIBRATING',
  PREVIEWING: 'CALIBRATING',
  READY: 'ARMED',
  MATERIALIZING: 'MATERIALIZING',
  RENDERING: 'MATERIALIZING',
  OBJECT_READY: 'CYCLE COMPLETE',
  DISPENSER_READY: 'CYCLE COMPLETE',
  RETRIEVING: 'DISPENSING',
  RETRIEVED: 'CHAMBER CLEAR',
  ERROR: 'FAULT',
}

const ACTIVE: readonly MachineStatus[] = ['MATERIALIZING', 'RENDERING']
const COMPLETE: readonly MachineStatus[] = ['OBJECT_READY', 'DISPENSER_READY']

interface FabricationChamberProps {
  status: MachineStatus
  params: MachineParams
}

/**
 * The machine's active work area (plan §7). Full-width between the deck and the
 * dispenser, and the region that consumes the deck's dead space. It must read as
 * somewhere materialization physically happens: subdued at rest, active during
 * MATERIALIZING. The readout is driven entirely by existing machine state — it
 * adds no controls.
 */
export function FabricationChamber({ status, params }: FabricationChamberProps) {
  const active = ACTIVE.includes(status)
  const complete = COMPLETE.includes(status)
  const pressure = Math.round(params.puffiness * 100)
  const thermal = Math.round((0.34 + params.foldDensity * 0.48) * 100)

  return (
    <section
      className="chamber"
      aria-label="Fabrication chamber"
      data-active={active || undefined}
      data-complete={complete || undefined}
    >
      <header className="chamber__header">
        <MachineLabel heading tone="primary" code="FC-08" as="h2">
          FABRICATION CHAMBER
        </MachineLabel>
      </header>

      <div className="chamber__body">
        <div className="chamber__window" aria-hidden="true">
          <span className="chamber__rib" />
          <span className="chamber__rib" />
          <span className="chamber__rib" />
          <span className="chamber__tube" />
          <span className="chamber__strip" />
          <span className="chamber__glow" />
        </div>

        <dl className="chamber__readout">
          <div className="chamber__item">
            <dt>STAGE</dt>
            <dd>{STAGE[status]}</dd>
          </div>
          <div className="chamber__item">
            <dt>PRESSURE</dt>
            <dd>{pressure}%</dd>
          </div>
          <div className="chamber__item">
            <dt>THERMAL</dt>
            <dd>{thermal}%</dd>
          </div>
          <div className="chamber__item">
            <dt>CYCLE</dt>
            <dd>{complete ? 'DONE' : active ? 'RUN' : 'IDLE'}</dd>
          </div>
        </dl>
      </div>

      <Vents count={12} className="chamber__vents" />
    </section>
  )
}
