import type { ReactNode } from 'react'

import { CRTFeedback } from './CRTFeedback'
import type { MachineState } from '../../state/machineState'
import type { MachineParams } from '../../state/params'

interface CRTStateProps {
  machine: MachineState
  params: MachineParams
  /** The rendered object (supplied by the renderer once integrated). */
  objectNode?: ReactNode
  /** The live-preview object shown while configuring (handoff §14). */
  previewNode?: ReactNode
  referenceUrl?: string | null
  referenceName?: string | null
}

const SEQUENCE = ['GEOMETRY', 'INFLATING', 'MATERIALIZING', 'RENDERING'] as const

/**
 * Maps the machine status to the CRT screen content (handoff §5, §6, §16).
 * The CRT is the machine's central communication surface — every state speaks
 * through it rather than through generic UI chrome.
 */
export function CRTState({
  machine,
  objectNode,
  previewNode,
  referenceUrl,
  referenceName,
}: CRTStateProps) {
  const { status } = machine

  switch (status) {
    case 'IDLE':
    case 'REFERENCE_LOADED':
    case 'CONFIGURING':
    case 'PREVIEWING':
    case 'READY':
      return (
        <div className="crt-screen crt-screen--workspace">
          <div className="crt-workspace__view">
            {previewNode ??
              (referenceUrl ? (
                <img
                  className="crt-reference"
                  src={referenceUrl}
                  alt={`Reference silhouette${referenceName ? `: ${referenceName}` : ''}`}
                />
              ) : (
                <div className="crt-workspace__idle">
                  <p className="crt-screen__head">FORM//LAB</p>
                  <p>INSERT REFERENCE</p>
                </div>
              ))}
            <span className="crt-workspace__phase" role="status">
              {status === 'READY'
                ? 'READY TO MATERIALIZE'
                : status === 'REFERENCE_LOADED'
                  ? 'REFERENCE LOCKED'
                  : status === 'IDLE'
                    ? 'AWAITING REFERENCE GEOMETRY'
                    : 'PARAMETER REVIEW'}
            </span>
          </div>
          <CRTFeedback />
        </div>
      )

    case 'MATERIALIZING':
    case 'RENDERING':
      return (
        <div className="crt-screen crt-screen--busy" role="status">
          <p className="crt-screen__head">FABRICATION IN PROGRESS</p>
          <ul className="crt-sequence">
            {SEQUENCE.map((step) => (
              <li key={step} className="crt-sequence__step">
                {step}
              </li>
            ))}
          </ul>
          <p className="crt-screen__status">
            {status === 'RENDERING' ? 'RENDERING…' : 'INFLATING…'}
          </p>
        </div>
      )

    case 'OBJECT_READY':
    case 'DISPENSER_READY':
      return (
        <div className="crt-screen crt-screen--workspace">
          <div className="crt-workspace__view">
            {objectNode ?? <span className="crt-screen__object-placeholder" />}
            <span className="crt-reveal" aria-hidden="true" />
            <span className="crt-workspace__phase" role="status">
              OBJECT COMPLETE
            </span>
          </div>
          <CRTFeedback />
          <p className="crt-complete-hint">↓ SCROLL TO DISPENSE ↓</p>
        </div>
      )

    case 'RETRIEVING':
      return (
        <div className="crt-screen crt-screen--busy" role="status">
          <p className="crt-screen__head">DISPENSING</p>
          <p className="crt-screen__line">OBJECT IN TRANSIT</p>
          <p className="crt-screen__status">PLEASE WAIT…</p>
        </div>
      )

    case 'RETRIEVED':
      return (
        <div className="crt-screen crt-screen--workspace">
          <div className="crt-workspace__idle" role="status">
            <p className="crt-screen__head">OBJECT RETRIEVED</p>
            <p>DISPENSER TRAY — BELOW</p>
            <p>EXPORT OR MAKE ANOTHER</p>
          </div>
          <CRTFeedback />
        </div>
      )

    case 'ERROR':
      return (
        <div className="crt-screen crt-screen--error" role="alert">
          <p className="crt-screen__head crt-screen__head--fault">SYSTEM FAULT</p>
          <p className="crt-screen__line">{machine.error ?? 'UNKNOWN FAULT'}</p>
          <p className="crt-screen__status">PRESS RESET TO RECOVER</p>
        </div>
      )

    default:
      return null
  }
}
