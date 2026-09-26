import type { ReactNode } from 'react'

import { MaterialColorPicker } from '../materials/MaterialColorPicker'
import { MaterialSelector } from '../materials/MaterialSelector'
import { MechanicalSlider } from '../controls/MechanicalSlider'
import { RotaryKnob } from '../controls/RotaryKnob'
import { SelectorSwitch } from '../controls/SelectorSwitch'
import { ToggleSwitch } from '../controls/ToggleSwitch'
import { ReferenceFilm } from '../reference/ReferenceFilm'
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
  params: MachineParams
  update: <K extends keyof MachineParams>(key: K, value: MachineParams[K]) => void
  onMaterial: (id: MaterialKey) => void
  referenceUrl: string | null
  shapeCode: string
  onReferenceFile: (file: File) => void
  onReferenceReset: () => void
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

/** The left-hand control panel of the upper deck (handoff §4, §6). */
export function ControlPanel({
  params,
  update,
  onMaterial,
  referenceUrl,
  shapeCode,
  onReferenceFile,
  onReferenceReset,
}: ControlPanelProps) {
  return (
    <div className="control-panel">
      <Section code={SECTIONS.reference.code} title={SECTIONS.reference.title}>
        <ReferenceFilm
          previewUrl={referenceUrl}
          shapeCode={shapeCode}
          onFile={onReferenceFile}
          onReset={onReferenceReset}
        />
      </Section>

      <Section code={SECTIONS.material.code} title={SECTIONS.material.title}>
        <MaterialSelector value={params.material} onChange={onMaterial} />
        <MaterialColorPicker value={params.color} onChange={(hex) => update('color', hex)} />
        <SelectorSwitch
          label="TRANSPARENCY"
          options={TRANSPARENCY_OPTIONS}
          value={params.transparency}
          onChange={(v) => update('transparency', v)}
        />
      </Section>
    </div>
  )
}

/**
 * Inflation controls. Grouped with the AIR PRESSURE gauge in the instrumentation
 * column — the gauge is the physical readout of puffiness, so they belong
 * together (plan §7.1).
 */
export function InflationControls({
  params,
  update,
}: {
  params: MachineParams
  update: <K extends keyof MachineParams>(key: K, value: MachineParams[K]) => void
}) {
  return (
    <Section code={SECTIONS.inflation.code} title={SECTIONS.inflation.title}>
      <div className="knob-group">
        <RotaryKnob
          variant="primary"
          label={INFLATION_CONTROLS.puffiness.label}
          value={params.puffiness}
          onChange={(v) => update('puffiness', v)}
        />
      </div>
      <div className="knob-group knob-group--pair">
        <RotaryKnob
          variant="machined"
          label={INFLATION_CONTROLS.asymmetry.label}
          value={params.asymmetry}
          onChange={(v) => update('asymmetry', v)}
        />
        <RotaryKnob
          variant="ribbed"
          label={INFLATION_CONTROLS.gloss.label}
          value={params.gloss}
          onChange={(v) => update('gloss', v)}
        />
      </div>
      <MechanicalSlider
        label={INFLATION_CONTROLS.foldDensity.label}
        low={INFLATION_CONTROLS.foldDensity.low}
        high={INFLATION_CONTROLS.foldDensity.high}
        value={params.foldDensity}
        onChange={(v) => update('foldDensity', v)}
      />
    </Section>
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
}: {
  params: MachineParams
  update: <K extends keyof MachineParams>(key: K, value: MachineParams[K]) => void
}) {
  return (
    <Section code={SECTIONS.scene.code} title={SECTIONS.scene.title}>
      <SelectorSwitch
        label="BACKGROUND"
        options={BACKGROUND_OPTIONS}
        value={params.background}
        onChange={(v) => update('background', v)}
      />
      <SelectorSwitch
        label="LIGHTING"
        options={LIGHTING_OPTIONS}
        value={params.lighting}
        onChange={(v) => update('lighting', v)}
      />
      <div className="toggle-stack">
        <ToggleSwitch
          label="CAST SHADOWS"
          checked={params.shadows}
          onChange={(v) => update('shadows', v)}
          hint="Ground shadow under the object"
        />
        <ToggleSwitch
          label="INTERIOR CUTOUTS"
          checked={params.interiorCutouts}
          onChange={(v) => update('interiorCutouts', v)}
        />
      </div>
    </Section>
  )
}
