import { MACHINE } from '../../data/machineConfig'
import { Screw } from './Screw'

function Marking({ label, value }: { label: string; value: string }) {
  return (
    <span className="marking">
      <span className="marking__label">{label}</span>
      <span className="marking__value">{value}</span>
    </span>
  )
}

/** Branding + industrial nameplate identity (handoff §2, §4). */
export function MachineHeader() {
  return (
    <header className="machine__header">
      <Screw className="machine__header-screw machine__header-screw--l" />

      <div className="machine__identity">
        <span className="machine__brand">{MACHINE.brand}</span>
        <span className="machine__unit">{MACHINE.unitName}</span>
      </div>

      <div className="machine__markings">
        <Marking label="MODEL" value={MACHINE.model} />
        <Marking label="TYPE" value={MACHINE.type} />
        <Marking label="REV" value={MACHINE.rev} />
      </div>

      <div className="machine__markings machine__markings--secondary">
        <Marking label="INPUT" value={MACHINE.input} />
        <Marking label="OUTPUT" value={MACHINE.output} />
        <Marking label="SERIAL" value={MACHINE.serial} />
      </div>

      <Screw className="machine__header-screw machine__header-screw--r" />
    </header>
  )
}
