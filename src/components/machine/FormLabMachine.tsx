import { lazy, Suspense, useCallback, useEffect, useMemo, useRef } from 'react'

import { PushButton } from '../controls/PushButton'
import { ToggleSwitch } from '../controls/ToggleSwitch'
import { CRTDisplay } from '../crt/CRTDisplay'
import { CRTState } from '../crt/CRTState'
import { AnalogGauge } from './AnalogGauge'
import { ControlPanel, InflationControls, SceneControls } from './ControlPanel'
import { Dispenser, type DispenserMode } from './dispenser/Dispenser'
import { MachineChassis } from './MachineChassis'
import { MachineHeader } from './MachineHeader'
import { MachineLabel } from './MachineLabel'
import { Cavity } from './Cavity'
import { StatusLights } from './StatusLights'
import { INFLATION_CONTROLS } from '../../data/machineConfig'
import { extractContourFromImage } from '../../engine/silhouette'
import { appearanceForParams } from '../../state/appearance'
import { indicatorStatesFor } from '../../state/indicators'
import { canMaterializeNow } from '../../state/machineState'
import { useMachineStore } from '../../state/machineStore'
import { useFabrication } from '../../state/useFabrication'
import { useLivePreview } from '../../state/useLivePreview'
import { useRetrieval } from '../../state/useRetrieval'

// The renderer pulls in Three.js — load it only once an object exists, keeping
// the initial machine bundle light.
const CRTRenderer = lazy(() =>
  import('../crt/CRTRenderer').then((module) => ({ default: module.CRTRenderer })),
)

/** FORM//LAB machine — orchestrates the whole experience (handoff §4, §21, §34). */
export function FormLabMachine() {
  const machine = useMachineStore((s) => s.machine)
  const params = useMachineStore((s) => s.params)
  const updateParam = useMachineStore((s) => s.updateParam)
  const applyMaterial = useMachineStore((s) => s.applyMaterial)
  const referenceUrl = useMachineStore((s) => s.referenceUrl)
  const shapeCode = useMachineStore((s) => s.shapeCode)
  const setReference = useMachineStore((s) => s.setReference)
  const clearReference = useMachineStore((s) => s.clearReference)
  const setContour = useMachineStore((s) => s.setContour)
  const object = useMachineStore((s) => s.object)
  const previewObject = useMachineStore((s) => s.previewObject)
  const livePreview = useMachineStore((s) => s.livePreview)
  const autoGenerate = useMachineStore((s) => s.autoGenerate)
  const setLivePreview = useMachineStore((s) => s.setLivePreview)
  const setAutoGenerate = useMachineStore((s) => s.setAutoGenerate)
  const dispatch = useMachineStore((s) => s.dispatch)
  const resetUnit = useMachineStore((s) => s.resetUnit)
  const makeAnother = useMachineStore((s) => s.makeAnother)

  const { materialize } = useFabrication()
  const { retrieve } = useRetrieval()
  useLivePreview()

  const objectUrlRef = useRef<string | null>(null)
  const dispenserRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const handleReferenceFile = useCallback(
    async (file: File) => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      const url = URL.createObjectURL(file)
      objectUrlRef.current = url
      setReference(url, file.name.replace(/\.[^.]+$/, '').toUpperCase())
      const contour = await extractContourFromImage(file)
      if (contour) setContour(contour, 'REFERENCE')
    },
    [setContour, setReference],
  )

  const handleReferenceReset = useCallback(() => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
    clearReference()
  }, [clearReference])

  const handleDownload = useCallback(() => {
    const current = useMachineStore.getState().object
    if (!current) return
    const link = document.createElement('a')
    link.href = current.preview
    link.download = `${current.id}.svg`
    link.click()
  }, [])

  const handleView = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Advance to DISPENSER_READY when the lower section scrolls into view (§21).
  useEffect(() => {
    const element = dispenserRef.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) dispatch({ type: 'DISPENSER_VIEW' })
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [dispatch])

  // Auto-generate: materialize once edits settle into READY (opt-in, handoff §6).
  useEffect(() => {
    if (autoGenerate && machine.status === 'READY') {
      void materialize()
    }
  }, [autoGenerate, machine.status, materialize])

  const appearance = useMemo(() => appearanceForParams(params), [params])
  const indicatorStates = useMemo(() => indicatorStatesFor(machine.status), [machine.status])

  const showObject =
    object !== null &&
    (machine.status === 'OBJECT_READY' || machine.status === 'DISPENSER_READY')

  const objectNode = showObject ? (
    <Suspense fallback={<span className="crt-screen__object-placeholder" />}>
      <CRTRenderer
        object={object}
        appearance={appearance}
        background={params.background}
        lighting={params.lighting}
        shadows={params.shadows}
      />
    </Suspense>
  ) : undefined

  const previewNode =
    livePreview && previewObject ? (
      <Suspense fallback={<span className="crt-screen__object-placeholder" />}>
        <CRTRenderer
          object={previewObject}
          appearance={appearance}
          background={params.background}
          lighting={params.lighting}
          shadows={params.shadows}
        />
      </Suspense>
    ) : undefined

  const dispenserMode: DispenserMode =
    machine.status === 'RETRIEVED'
      ? 'retrieved'
      : machine.status === 'OBJECT_READY' ||
          machine.status === 'DISPENSER_READY' ||
          machine.status === 'RETRIEVING'
        ? 'online'
        : 'offline'

  return (
    <MachineChassis>
      <div className="machine">
        <MachineHeader />

        <div className="machine__deck">
          <ControlPanel
            params={params}
            update={updateParam}
            onMaterial={applyMaterial}
            referenceUrl={referenceUrl}
            shapeCode={shapeCode}
            onReferenceFile={handleReferenceFile}
            onReferenceReset={handleReferenceReset}
          />

          <div className="machine__center">
            <CRTDisplay>
              <CRTState machine={machine} params={params} objectNode={objectNode} previewNode={previewNode} />
            </CRTDisplay>

            <div className="machine__materialize">
              <Cavity className="materialize" screws>
                <MachineLabel heading tone="primary" code="MW-05" as="h2">
                  MATERIALIZATION
                </MachineLabel>
                <PushButton
                  variant="primary"
                  size="lg"
                  beam
                  disabled={!canMaterializeNow(machine)}
                  onClick={() => void materialize()}
                >
                  MATERIALIZE
                </PushButton>
                {machine.status === 'ERROR' && (
                  <PushButton variant="ghost" onClick={() => dispatch({ type: 'DISMISS_ERROR' })}>
                    CLEAR FAULT
                  </PushButton>
                )}
              </Cavity>
            </div>

            <Cavity className="status-panel" screws>
              <MachineLabel heading tone="primary" code="ST-06" as="h2">
                SYSTEM STATUS
              </MachineLabel>
              <StatusLights states={indicatorStates} layout="row" />
            </Cavity>
          </div>

          <aside className="machine__status">
            <Cavity className="gauge-panel" screws>
              <AnalogGauge
                label={INFLATION_CONTROLS.puffiness.label}
                low={INFLATION_CONTROLS.puffiness.low}
                high={INFLATION_CONTROLS.puffiness.high}
                value={params.puffiness}
              />
            </Cavity>

            <InflationControls params={params} update={updateParam} />

            <Cavity className="process-panel" screws>
              <MachineLabel heading tone="primary" code="PR-07" as="h2">
                PROCESSING
              </MachineLabel>
              <div className="toggle-stack">
                <ToggleSwitch
                  label="LIVE PREVIEW"
                  checked={livePreview}
                  onChange={setLivePreview}
                  hint="Auto-preview after edits settle"
                />
                <ToggleSwitch
                  label="AUTO GENERATE"
                  checked={autoGenerate}
                  onChange={setAutoGenerate}
                />
              </div>
              <PushButton variant="ghost" onClick={resetUnit}>
                RESET UNIT
              </PushButton>
            </Cavity>

            <SceneControls params={params} update={updateParam} />
          </aside>
        </div>

        <MachineLabel className="machine__scroll-hint" tone="technical">
          ↓ FABRICATION &amp; DISPENSER
        </MachineLabel>

        <div ref={dispenserRef}>
          <Dispenser
            mode={dispenserMode}
            objectSlot={
              object ? (
                <img className="retrieval__object" src={object.preview} alt="Retrieved object" />
              ) : undefined
            }
            onRetrieve={() => retrieve(false)}
            skippable={machine.retrievalCount > 0}
            onSkip={() => retrieve(true)}
            onDownload={handleDownload}
            onView={handleView}
            onMakeAnother={makeAnother}
          />
        </div>
      </div>
    </MachineChassis>
  )
}
