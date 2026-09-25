import type { ReactNode } from 'react'

import { MACHINE } from '../../data/machineConfig'
import { MATERIAL_BY_ID } from '../../data/materialPresets'
import type { MachineState } from '../../state/machineState'
import type { MachineParams } from '../../state/params'

interface CRTStateProps {
  machine: MachineState
  params: MachineParams
  /** The rendered object (supplied by the renderer once integrated). */
  objectNode?: ReactNode
  /** The live-preview object shown while configuring (handoff §14). */
  previewNode?: ReactNode
}

const pct = (n: number) => `${Math.round(n * 100)}%`

function Readout({ params }: { params: MachineParams }) {
  const preset = MATERIAL_BY_ID[params.material]
  return (
    <dl className="crt-readout">
      <div className="crt-readout__item">
        <dt>MATERIAL</dt>
        <dd>{preset.name.toUpperCase()}</dd>
      </div>
      <div className="crt-readout__item">
        <dt>PUFFINESS</dt>
        <dd>{pct(params.puffiness)}</dd>
      </div>
      <div className="crt-readout__item">
        <dt>GLOSS</dt>
        <dd>{pct(params.gloss)}</dd>
      </div>
      <div className="crt-readout__item">
        <dt>DEFORMATION</dt>
        <dd>{pct(params.asymmetry)}</dd>
      </div>
    </dl>
  )
}

const SEQUENCE = ['GEOMETRY', 'INFLATING', 'MATERIALIZING', 'RENDERING'] as const

/**
 * Maps the machine status to the CRT screen content (handoff §5, §6, §16).
 * The CRT is the machine's central communication surface — every state speaks
 * through it rather than through generic UI chrome.
 */
export function CRTState({ machine, params, objectNode, previewNode }: CRTStateProps) {
  const { status } = machine

  switch (status) {
    case 'IDLE':
      return (
        <div className="crt-screen crt-screen--idle">
          <p className="crt-screen__brand">{MACHINE.brand}</p>
          <p className="crt-screen__sys">{MACHINE.unitName}</p>
          <p className="crt-screen__idle">AWAITING REFERENCE GEOMETRY</p>
          <p className="crt-screen__hint">DROP A SILHOUETTE TO BEGIN</p>
          <p className="crt-screen__status">
            SYSTEM: <span className="crt-screen__ready">READY</span>
          </p>
        </div>
      )

    case 'REFERENCE_LOADED':
      return (
        <div className="crt-screen">
          <p className="crt-screen__head">REFERENCE LOCKED</p>
          <p className="crt-screen__line">GEOMETRY DETECTED</p>
          <p className="crt-screen__line">BOUNDARY COMPLEXITY: LOW</p>
          <p className="crt-screen__status">READY TO INFLATE</p>
        </div>
      )

    case 'CONFIGURING':
    case 'PREVIEWING':
    case 'READY': {
      const text = (
        <>
          <p className="crt-screen__head">
            {status === 'READY' ? 'PARAMETERS SET' : 'PARAMETER REVIEW'}
          </p>
          <Readout params={params} />
          {status === 'PREVIEWING' && <p className="crt-screen__status">PREVIEWING…</p>}
          {status === 'READY' && (
            <p className="crt-screen__status">
              READY TO <span className="crt-screen__ready">MATERIALIZE</span>
            </p>
          )}
        </>
      )

      if (previewNode) {
        return (
          <div className="crt-screen crt-screen--object">
            <div className="crt-screen__object">{previewNode}</div>
            <div className="crt-screen__overlay">{text}</div>
          </div>
        )
      }
      return <div className="crt-screen">{text}</div>
    }

    case 'MATERIALIZING':
    case 'RENDERING':
      return (
        <div className="crt-screen crt-screen--busy">
          <p className="crt-screen__head">FABRICATION IN PROGRESS</p>
          <ul className="crt-sequence">
            {SEQUENCE.map((step) => (
              <li key={step} className="crt-sequence__step">
                {step}
              </li>
            ))}
          </ul>
          <p className="crt-screen__status">{status === 'RENDERING' ? 'RENDERING…' : 'INFLATING…'}</p>
        </div>
      )

    case 'OBJECT_READY':
    case 'DISPENSER_READY':
      return (
        <div className="crt-screen crt-screen--object">
          <div className="crt-screen__object">
            {objectNode ?? <span className="crt-screen__object-placeholder" />}
            <span className="crt-reveal" aria-hidden="true" />
          </div>
          <div className="crt-screen__overlay">
            <p className="crt-screen__head">OBJECT COMPLETE</p>
            <Readout params={params} />
            <p className="crt-screen__status">↓ SCROLL TO DISPENSE ↓</p>
          </div>
        </div>
      )

    case 'RETRIEVING':
      return (
        <div className="crt-screen crt-screen--busy">
          <p className="crt-screen__head">DISPENSING</p>
          <p className="crt-screen__line">OBJECT IN TRANSIT</p>
          <p className="crt-screen__status">PLEASE WAIT…</p>
        </div>
      )

    case 'RETRIEVED':
      return (
        <div className="crt-screen">
          <p className="crt-screen__head">OBJECT RETRIEVED</p>
          <p className="crt-screen__line">DISPENSER TRAY — BELOW</p>
          <p className="crt-screen__status">EXPORT OR MAKE ANOTHER</p>
        </div>
      )

    case 'ERROR':
      return (
        <div className="crt-screen crt-screen--error">
          <p className="crt-screen__head crt-screen__head--fault">SYSTEM FAULT</p>
          <p className="crt-screen__line">{machine.error ?? 'UNKNOWN FAULT'}</p>
          <p className="crt-screen__status">PRESS RESET TO RECOVER</p>
        </div>
      )

    default:
      return null
  }
}
