import { create } from 'zustand'

import { MATERIAL_BY_ID, type MaterialKey } from '../data/materialPresets'
import { DEFAULT_SILHOUETTE } from '../data/sampleSilhouettes'
import type { RenderedObject, Transparency, Vec2 } from '../engine/types'
import {
  INITIAL_MACHINE_STATE,
  machineReducer,
  type MachineEvent,
  type MachineState,
} from './machineState'
import { controlsLocked, type ControlFeedback } from './controlFeedback'
import { DEFAULT_PARAMS, type MachineParams } from './params'

/** Derive a transparency mode from a material's transmission value. */
function transparencyFor(transmission: number): Transparency {
  if (transmission >= 0.5) return 'clear'
  if (transmission >= 0.2) return 'translucent'
  return 'opaque'
}

interface MachineStore {
  feedback: ControlFeedback
  colorEditing: boolean
  setColorEditing: (editing: boolean) => void
  generationRevision: number
  previewStatus: 'empty' | 'pending' | 'current' | 'failed'
  setPreviewStatus: (status: MachineStore['previewStatus']) => void
  referenceProblem: string | null
  setReferenceProblem: (message: string | null) => void
  // --- Machine status (single source of truth) ---
  machine: MachineState
  dispatch: (event: MachineEvent) => void
  /** Full service reset — back to IDLE, clearing reference, object and preview. */
  resetUnit: () => void
  /** Keep the reference but start a fresh object (handoff §20 "MAKE ANOTHER"). */
  makeAnother: () => void
  params: MachineParams
  updateParam: <K extends keyof MachineParams>(key: K, value: MachineParams[K]) => void
  applyMaterial: (id: MaterialKey) => void
  referenceUrl: string | null
  referenceName: string | null
  setReference: (url: string, name: string) => void
  clearReference: () => void

  contour: Vec2[]
  /** Interior cutouts of the reference (letter counters etc.), same shape space. */
  holes: Vec2[][]
  shapeCode: string
  setContour: (contour: Vec2[], shapeCode: string, holes?: Vec2[][]) => void

  // --- Rendered object ---
  object: RenderedObject | null
  setObject: (object: RenderedObject | null) => void

  // --- Live preview object (Layer 1, low-res, handoff §14) ---
  previewObject: RenderedObject | null
  setPreviewObject: (object: RenderedObject | null) => void

  // --- Processing toggles ---
  livePreview: boolean
  autoGenerate: boolean
  setLivePreview: (value: boolean) => void
  setAutoGenerate: (value: boolean) => void
}

export const useMachineStore = create<MachineStore>((set) => ({
  feedback: 'material',
  colorEditing: false,
  setColorEditing: (editing) =>
    set((state) =>
      controlsLocked(state.machine.status) ? {} : { colorEditing: editing, feedback: 'color' },
    ),
  generationRevision: 0,
  previewStatus: 'empty',
  setPreviewStatus: (previewStatus) => set({ previewStatus }),
  referenceProblem: null,
  setReferenceProblem: (referenceProblem) => set({ referenceProblem, feedback: 'reference' }),
  machine: INITIAL_MACHINE_STATE,
  dispatch: (event) => set((state) => ({ machine: machineReducer(state.machine, event) })),

  params: DEFAULT_PARAMS,
  updateParam: (key, value) =>
    set((state) => {
      if (controlsLocked(state.machine.status)) return {}
      const machine = machineReducer(state.machine, { type: 'PARAMS_CHANGED' })
      return {
        params: { ...state.params, [key]: value },
        feedback: key,
        generationRevision: state.generationRevision + 1,
        previewObject: null,
        previewStatus: state.livePreview && machine.hasReference ? 'pending' : 'empty',
        machine,
        object: machine.status === 'CONFIGURING' ? null : state.object,
      }
    }),
  applyMaterial: (id) =>
    set((state) => {
      if (controlsLocked(state.machine.status)) return {}
      const preset = MATERIAL_BY_ID[id]
      const machine = machineReducer(state.machine, { type: 'PARAMS_CHANGED' })
      return {
        feedback: 'material',
        colorEditing: false,
        generationRevision: state.generationRevision + 1,
        previewObject: null,
        previewStatus: state.livePreview && machine.hasReference ? 'pending' : 'empty',
        params: {
          ...state.params,
          material: id,
          color: preset.color,
          transparency: transparencyFor(preset.shader.transmission),
          puffiness: preset.inflation.puffiness,
          foldDensity: preset.inflation.foldDensity,
          gloss: preset.inflation.gloss,
        },
        machine,
        object: machine.status === 'CONFIGURING' ? null : state.object,
      }
    }),

  referenceUrl: null,
  referenceName: null,
  setReference: (url, name) =>
    set((state) =>
      controlsLocked(state.machine.status)
        ? {}
        : {
            feedback: 'reference',
            referenceProblem: null,
            colorEditing: false,
            generationRevision: state.generationRevision + 1,
            previewStatus: state.livePreview ? 'pending' : 'empty',
            referenceUrl: url,
            referenceName: name,
            machine: machineReducer(state.machine, { type: 'REFERENCE_SET' }),
            object: null,
            previewObject: null,
          },
    ),
  clearReference: () =>
    set((state) =>
      controlsLocked(state.machine.status)
        ? {}
        : {
            referenceUrl: null,
            referenceName: null,
            contour: DEFAULT_SILHOUETTE.contour,
            holes: [],
            shapeCode: DEFAULT_SILHOUETTE.code,
            machine: machineReducer(state.machine, { type: 'REFERENCE_CLEARED' }),
            feedback: 'reference',
            colorEditing: false,
            referenceProblem: null,
            generationRevision: state.generationRevision + 1,
            previewStatus: 'empty',
            object: null,
            previewObject: null,
          },
    ),

  resetUnit: () =>
    set((state) => ({
      machine: machineReducer(state.machine, { type: 'RESET' }),
      feedback: 'material',
      colorEditing: false,
      referenceProblem: null,
      generationRevision: state.generationRevision + 1,
      previewStatus: 'empty',
      referenceUrl: null,
      referenceName: null,
      contour: DEFAULT_SILHOUETTE.contour,
      holes: [],
      shapeCode: DEFAULT_SILHOUETTE.code,
      object: null,
      previewObject: null,
    })),

  makeAnother: () =>
    set((state) => {
      const machine = machineReducer(state.machine, { type: 'NEW_OBJECT' })
      if (machine === state.machine) return {}
      return {
        machine,
        generationRevision: state.generationRevision + 1,
        previewStatus: state.livePreview && machine.hasReference ? 'pending' : 'empty',
        object: null,
        previewObject: null,
      }
    }),

  contour: DEFAULT_SILHOUETTE.contour,
  holes: [],
  shapeCode: DEFAULT_SILHOUETTE.code,
  setContour: (contour, shapeCode, holes = []) =>
    set((state) =>
      controlsLocked(state.machine.status)
        ? {}
        : {
            contour,
            holes,
            shapeCode,
            generationRevision: state.generationRevision + 1,
            previewObject: null,
            previewStatus: state.livePreview ? 'pending' : 'empty',
          },
    ),

  object: null,
  setObject: (object) => set({ object }),

  previewObject: null,
  setPreviewObject: (previewObject) => set({ previewObject }),

  livePreview: true,
  autoGenerate: false,
  setLivePreview: (value) =>
    set((state) =>
      controlsLocked(state.machine.status)
        ? {}
        : {
            livePreview: value,
            feedback: 'livePreview',
            generationRevision: state.generationRevision + 1,
            previewObject: null,
            previewStatus:
              value &&
              state.machine.hasReference &&
              ['REFERENCE_LOADED', 'CONFIGURING', 'PREVIEWING', 'READY'].includes(
                state.machine.status,
              )
                ? 'pending'
                : 'empty',
          },
    ),
  setAutoGenerate: (value) =>
    set((state) =>
      controlsLocked(state.machine.status) ? {} : { autoGenerate: value, feedback: 'autoGenerate' },
    ),
}))
