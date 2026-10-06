import { useEffect, useRef, useState, type FormEvent } from 'react'
import { COLOR_PRESETS, MATERIAL_BY_ID, MATERIAL_PRESETS } from '../../data/materialPresets'
import { CONTROL_LABELS } from '../../state/controlFeedback'
import { useMachineStore } from '../../state/machineStore'

function ColorEditor() {
  const color = useMachineStore((s) => s.params.color)
  const update = useMachineStore((s) => s.updateParam)
  const close = useMachineStore((s) => s.setColorEditing)
  const [draft, setDraft] = useState(color)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    input.current?.focus()
    input.current?.select()
  }, [])
  const finish = () => {
    close(false)
    document.getElementById('color-edit-key')?.focus()
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!/^#[0-9a-f]{6}$/i.test(draft.trim())) {
      setError('ENTER A HEX COLOR: #RRGGBB')
      return
    }
    update('color', draft.trim().toUpperCase())
    finish()
  }
  return (
    <form
      className="crt-color-editor"
      onSubmit={submit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          finish()
        }
      }}
      aria-label="Color editor"
    >
      <label htmlFor="crt-color-value">EDIT COLOR</label>
      <input
        ref={input}
        id="crt-color-value"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          setError('')
        }}
        spellCheck={false}
        maxLength={7}
        aria-describedby="crt-color-help"
        aria-invalid={Boolean(error)}
      />
      <p id="crt-color-help">#RRGGBB · ENTER TO APPLY · ESC TO CANCEL</p>
      {error && <p role="alert">{error}</p>}
      <div>
        <button type="submit">APPLY</button>
        <button type="button" onClick={finish}>
          CANCEL
        </button>
      </div>
    </form>
  )
}

/** Display-only feedback derives from the same values driving hardware/engine. */
export function CRTFeedback() {
  const params = useMachineStore((s) => s.params)
  const feedback = useMachineStore((s) => s.feedback)
  const editing = useMachineStore((s) => s.colorEditing)
  const livePreview = useMachineStore((s) => s.livePreview)
  const autoGenerate = useMachineStore((s) => s.autoGenerate)
  const referenceName = useMachineStore((s) => s.referenceName)
  const referenceProblem = useMachineStore((s) => s.referenceProblem)
  const previewStatus = useMachineStore((s) => s.previewStatus)
  const material = MATERIAL_BY_ID[params.material]
  const index = MATERIAL_PRESETS.findIndex((p) => p.id === params.material)
  const colorName =
    COLOR_PRESETS.find((p) => p.value.toUpperCase() === params.color.toUpperCase())?.name ??
    'CUSTOM'
  const raw =
    feedback === 'livePreview'
      ? livePreview
      : feedback === 'autoGenerate'
        ? autoGenerate
        : feedback === 'reference'
          ? (referenceProblem ?? referenceName ?? 'INSERT REFERENCE')
          : params[feedback]
  const value =
    typeof raw === 'number'
      ? `${Math.round(raw * 100)}%`
      : typeof raw === 'boolean'
        ? raw
          ? 'ON'
          : 'OFF'
        : feedback === 'color'
          ? `${colorName} · ${params.color}`
          : String(raw).toUpperCase()
  return (
    <>
      <div className="crt-feedback" role="status" aria-live="polite" aria-atomic="true">
        <div className="crt-feedback__material">
          <span>{material.name.toUpperCase()}</span>
          <span>
            {index + 1} / {MATERIAL_PRESETS.length}
          </span>
        </div>
        <div className="crt-feedback__color">
          <span
            className="crt-feedback__swatch"
            style={{ background: params.color }}
            aria-hidden="true"
          />
          <span>
            {colorName} · {params.color} · {params.transparency.toUpperCase()}
          </span>
        </div>
        <div className="crt-feedback__detail">
          <span>{CONTROL_LABELS[feedback]}</span>
          <strong>{feedback === 'material' ? material.code : value}</strong>
        </div>
        {previewStatus === 'pending' && <small>PREVIEW UPDATING…</small>}
        {previewStatus === 'failed' && <small>PREVIEW UNAVAILABLE · MATERIALIZE TO RETRY</small>}
      </div>
      {editing && <ColorEditor />}
    </>
  )
}
