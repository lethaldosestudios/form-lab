import type { ReactNode } from 'react'

import { MaterialColorPicker } from '../materials/MaterialColorPicker'
import { MaterialSelector } from '../materials/MaterialSelector'
import { MechanicalSlider } from '../controls/MechanicalSlider'
import { RotaryKnob } from '../controls/RotaryKnob'
import { SelectorSwitch } from '../controls/SelectorSwitch'
import { ToggleSwitch } from '../controls/ToggleSwitch'
import { MachineLabel } from './MachineLabel'
import { Cavity, SubPanel } from './Cavity'
import { INFLATION_CONTROLS, SECTIONS } from '../../data/machineConfig'
import type { MaterialKey } from '../../data/materialPresets'
import {
  BACKGROUND_OPTIONS,
  LIGHTING_OPTIONS,
  TRANSPARENCY_OPTIONS,
  type MachineParams,
} from '../../state/params'

interface ControlPanelProps {
  disabled?: boolean
  params: MachineParams
  update: <K extends keyof MachineParams>(key: K, value: MachineParams[K]) => void
  onMaterial: (id: MaterialKey) => void
  onColorEdit: () => void
}

function Section({ code, title, children }: { code: string; title: string; children: ReactNode }) {
  return (
    <Cavity className="control-section" screws>
      {/* L2 — a labelled plate bolted into the recess; the controls mount through it. */}
      <SubPanel className="control-section__plate" screws>
        <MachineLabel heading tone="primary" code={code} as="h2">
          {title}
        </MachineLabel>
        <div className="control-section__body">{children}</div>
      </SubPanel>
    </Cavity>
  )
}

/** Compact material plate; all changing values are routed to the CRT. */
export function ControlPanel({
  params,
  update,
  onMaterial,
  onColorEdit,
  disabled = false,
}: ControlPanelProps) {
  return (
    <section className="material-plate" aria-label="Material control plate">
      <MachineLabel heading tone="primary" code={SECTIONS.material.code} as="h2">
        MATERIAL
      </MachineLabel>
      <div className="material-plate__browsers">
        <MaterialSelector value={params.material} onChange={onMaterial} disabled={disabled} />
        <MaterialColorPicker
          value={params.color}
          onChange={(hex) => update('color', hex)}
          onEdit={onColorEdit}
          disabled={disabled}
        />
      </div>
      <SelectorSwitch
        label="TRANSPARENCY"
        options={TRANSPARENCY_OPTIONS}
        value={params.transparency}
        onChange={(v) => update('transparency', v)}
        disabled={disabled}
        variant="frosted"
      />
    </section>
  )
}

/** Inflation plate with the approved chrome pressure control and retained secondary controls. */
export function InflationControls({
  params,
  update,
  disabled = false,
}: {
  disabled?: boolean
  params: MachineParams
  update: <K extends keyof MachineParams>(key: K, value: MachineParams[K]) => void
}) {
  return (
    <section className="inflation-plate" aria-label="Inflation controls">
      <MachineLabel heading tone="primary" code={SECTIONS.inflation.code} as="h2">
        INFLATION
      </MachineLabel>
      <div className="knob-group">
        <RotaryKnob
          showValue={false}
          disabled={disabled}
          variant="inflation"
          label={INFLATION_CONTROLS.puffiness.label}
          value={params.puffiness}
          onChange={(v) => update('puffiness', v)}
        />
      </div>
      <div className="knob-group knob-group--pair">
        <RotaryKnob
          disabled={disabled}
          variant="machined"
          label={INFLATION_CONTROLS.asymmetry.label}
          value={params.asymmetry}
          onChange={(v) => update('asymmetry', v)}
        />
        <RotaryKnob
          disabled={disabled}
          variant="ribbed"
          label={INFLATION_CONTROLS.gloss.label}
          value={params.gloss}
          onChange={(v) => update('gloss', v)}
        />
      </div>
      <MechanicalSlider
        disabled={disabled}
        label={INFLATION_CONTROLS.foldDensity.label}
        low={INFLATION_CONTROLS.foldDensity.low}
        high={INFLATION_CONTROLS.foldDensity.high}
        value={params.foldDensity}
        onChange={(v) => update('foldDensity', v)}
      />
    </section>
  )
}

/**
 * Scene / environment controls. Rendered with the instrumentation column rather
 * than the control assembly so the deck columns stay close in height and the
 * machine has no dead space (plan §7.1).
 */
export function SceneControls({
  params,
  update,
  disabled = false,
}: {
  disabled?: boolean
  params: MachineParams
  update: <K extends keyof MachineParams>(key: K, value: MachineParams[K]) => void
}) {
  return (
    <Section code={SECTIONS.scene.code} title={SECTIONS.scene.title}>
      <SelectorSwitch
        disabled={disabled}
        label="BACKGROUND"
        options={BACKGROUND_OPTIONS}
        value={params.background}
        onChange={(v) => update('background', v)}
      />
      <SelectorSwitch
        disabled={disabled}
        label="LIGHTING"
        options={LIGHTING_OPTIONS}
        value={params.lighting}
        onChange={(v) => update('lighting', v)}
      />
      <div className="toggle-stack">
        <ToggleSwitch
          disabled={disabled}
          label="CAST SHADOWS"
          checked={params.shadows}
          onChange={(v) => update('shadows', v)}
          hint="Ground shadow under the object"
        />
        <ToggleSwitch
          disabled={disabled}
          label="INTERIOR CUTOUTS"
          checked={params.interiorCutouts}
          onChange={(v) => update('interiorCutouts', v)}
        />
      </div>
    </Section>
  )
}
