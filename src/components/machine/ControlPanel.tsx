import type { ReactNode } from 'react'

import { MaterialColorPicker } from '../materials/MaterialColorPicker'
import { MaterialSelector } from '../materials/MaterialSelector'
import { MechanicalSlider } from '../controls/MechanicalSlider'
import { RotaryKnob } from '../controls/RotaryKnob'
import { SelectorSwitch } from '../controls/SelectorSwitch'
import { ToggleSwitch } from '../controls/ToggleSwitch'
import { ReferenceFilm } from '../reference/ReferenceFilm'
import { MachineLabel } from './MachineLabel'
import { Panel } from './Panel'
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
    <Panel className="control-section" screws>
      <MachineLabel heading tone="primary" code={code} as="h2">
        {title}
      </MachineLabel>
      <div className="control-section__body">{children}</div>
    </Panel>
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

      <Section code={SECTIONS.inflation.code} title={SECTIONS.inflation.title}>
        <div className="knob-row">
          <RotaryKnob
            label={INFLATION_CONTROLS.puffiness.label}
            value={params.puffiness}
            onChange={(v) => update('puffiness', v)}
          />
          <RotaryKnob
            label={INFLATION_CONTROLS.asymmetry.label}
            value={params.asymmetry}
            onChange={(v) => update('asymmetry', v)}
          />
          <RotaryKnob
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
    </div>
  )
}
