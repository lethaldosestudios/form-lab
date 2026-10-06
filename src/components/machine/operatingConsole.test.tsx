import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FormLabMachine } from './FormLabMachine'
import { useMachineStore } from '../../state/machineStore'
import { MATERIAL_BY_ID } from '../../data/materialPresets'
import { extractSilhouetteFromImage } from '../../engine/silhouette'
import { CONTROL_LABELS } from '../../state/controlFeedback'
import type { MachineParams } from '../../state/params'

vi.mock('../../state/useLivePreview', () => ({ useLivePreview: () => undefined }))
vi.mock('../../engine/silhouette', () => ({ extractSilhouetteFromImage: vi.fn() }))
vi.mock('../crt/CRTRenderer', () => ({ CRTRenderer: () => <div>Rendered preview</div> }))

beforeEach(() => {
  useMachineStore.setState(useMachineStore.getInitialState(), true)
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:reference'), revokeObjectURL: vi.fn() })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})
const feedback = () => within(document.querySelector('.crt-feedback') as HTMLElement)

describe('operating console routing', () => {
  it('selects recipes before reference input and synchronizes the CRT and dial', () => {
    render(<FormLabMachine />)
    fireEvent.click(screen.getByRole('button', { name: 'Previous material presets' }))
    expect(feedback().getByText('TOY')).toBeInTheDocument()
    expect(feedback().getByText('3 / 10')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'AIR PRESSURE' })).toHaveAttribute(
      'aria-valuenow',
      '80',
    )
    expect(useMachineStore.getState().params.color).toBe(MATERIAL_BY_ID.toy.color)
    expect(useMachineStore.getState().machine.status).toBe('IDLE')
  })
  it('clamps material ends and color browsing never changes the recipe', () => {
    useMachineStore.getState().applyMaterial('soft-plastic')
    render(<FormLabMachine />)
    expect(screen.getByRole('button', { name: 'Previous material presets' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Next colors' }))
    expect(useMachineStore.getState().params.color).toBe('#FF4500')
    expect(useMachineStore.getState().params.material).toBe('soft-plastic')
    expect(screen.getByRole('button', { name: 'Previous colors' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Next colors' }))
    expect(feedback().getByText('LIME · #8FE04A', { exact: true })).toBeInTheDocument()
    act(() => useMachineStore.getState().applyMaterial('chrome'))
    expect(feedback().getByText('CHROME')).toBeInTheDocument()
    expect(useMachineStore.getState().params.color).toBe('#C9CDD2')
  })
  it('starts unknown colors at the last palette entry when browsing upward', () => {
    useMachineStore.getState().updateParam('color', '#123456')
    render(<FormLabMachine />)
    fireEvent.click(screen.getByRole('button', { name: 'Previous colors' }))
    expect(useMachineStore.getState().params.color).toBe('#15171A')
    expect(screen.getByRole('button', { name: 'Next colors' })).toBeDisabled()
  })
  it('validates custom color on CRT, applies it, and restores EDIT focus', () => {
    render(<FormLabMachine />)
    fireEvent.click(screen.getByRole('button', { name: 'EDIT' }))
    const input = screen.getByLabelText('EDIT COLOR')
    fireEvent.change(input, { target: { value: '#XYZ123' } })
    fireEvent.submit(screen.getByRole('form', { name: 'Color editor' }))
    expect(screen.getByRole('alert')).toHaveTextContent('ENTER A HEX COLOR')
    expect(useMachineStore.getState().params.color).toBe('#FF4500')
    fireEvent.change(input, { target: { value: '#abcdef' } })
    fireEvent.submit(screen.getByRole('form', { name: 'Color editor' }))
    expect(feedback().getByText('CUSTOM · #ABCDEF', { exact: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EDIT' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'EDIT' }))
    fireEvent.change(screen.getByLabelText('EDIT COLOR'), { target: { value: '#112233' } })
    fireEvent.keyDown(screen.getByLabelText('EDIT COLOR'), { key: 'Escape' })
    expect(useMachineStore.getState().params.color).toBe('#ABCDEF')
  })
  it('routes transparency with its full accessible name', () => {
    render(<FormLabMachine />)
    fireEvent.click(screen.getByRole('radio', { name: 'TRANSLUCENT' }))
    expect(feedback().getByText('TRANSLUCENT', { exact: true })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'TRANSLUCENT' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })
  it('moves radio selection and focus together with arrow keys', () => {
    render(<FormLabMachine />)
    const opaque = screen.getByRole('radio', { name: 'OPAQUE' })
    opaque.focus()
    fireEvent.keyDown(opaque, { key: 'ArrowRight' })
    expect(screen.getByRole('radio', { name: 'TRANSLUCENT' })).toHaveFocus()
    expect(useMachineStore.getState().params.transparency).toBe('translucent')
  })
  it.each(['OBJECT_READY', 'DISPENSER_READY', 'RETRIEVED'] as const)(
    'keeps processing feedback and custom editing available after %s',
    (status) => {
      useMachineStore.setState({
        machine: { ...useMachineStore.getState().machine, status, hasReference: true },
      })
      render(<FormLabMachine />)
      fireEvent.click(screen.getByRole('switch', { name: 'LIVE PREVIEW' }))
      expect(feedback().getByText('OFF')).toBeInTheDocument()
      expect(useMachineStore.getState().machine.status).toBe(status)
      fireEvent.click(screen.getByRole('switch', { name: 'LIVE PREVIEW' }))
      expect(useMachineStore.getState().previewStatus).toBe('empty')
      expect(feedback().queryByText('PREVIEW UPDATING…')).toBeNull()
      fireEvent.click(screen.getByRole('button', { name: 'EDIT' }))
      expect(screen.getByLabelText('EDIT COLOR')).toHaveFocus()
      fireEvent.keyDown(screen.getByLabelText('EDIT COLOR'), { key: 'Escape' })
      expect(useMachineStore.getState().machine.status).toBe(status)
    },
  )
  const changes: [keyof MachineParams, MachineParams[keyof MachineParams], string][] = [
    ['puffiness', 0.85, '85%'],
    ['asymmetry', 0.15, '15%'],
    ['gloss', 0.95, '95%'],
    ['foldDensity', 0.2, '20%'],
    ['background', 'grid', 'GRID'],
    ['lighting', 'dramatic', 'DRAMATIC'],
    ['shadows', false, 'OFF'],
    ['interiorCutouts', true, 'ON'],
  ]
  it.each(changes)('reflects %s from the canonical parameters on the CRT', (key, value, text) => {
    render(<FormLabMachine />)
    act(() => useMachineStore.getState().updateParam(key, value))
    expect(feedback().getByText(CONTROL_LABELS[key])).toBeInTheDocument()
    expect(feedback().getByText(text)).toBeInTheDocument()
  })
  it('routes knob keyboard input and processing changes without a reference', () => {
    render(<FormLabMachine />)
    fireEvent.keyDown(screen.getByRole('slider', { name: 'AIR PRESSURE' }), { key: 'End' })
    expect(feedback().getByText('100%')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('switch', { name: 'LIVE PREVIEW' }))
    expect(feedback().getByText('LIVE PREVIEW')).toBeInTheDocument()
    expect(feedback().getByText('OFF')).toBeInTheDocument()
  })
  it('preserves extraction holes and uses the CRT as the reference viewport', async () => {
    vi.mocked(extractSilhouetteFromImage).mockResolvedValue({
      contour: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      holes: [[{ x: 0.2, y: 0.2 }]],
    })
    render(<FormLabMachine />)
    await act(async () =>
      fireEvent.change(screen.getByLabelText('Insert reference silhouette'), {
        target: { files: [new File(['data'], 'shape.png')] },
      }),
    )
    expect(screen.getByAltText('Reference silhouette: SHAPE').closest('.crt')).not.toBeNull()
    expect(useMachineStore.getState().holes).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'INSERT' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'RESET' }))
    expect(screen.queryByAltText('Reference silhouette: SHAPE')).not.toBeInTheDocument()
    expect(useMachineStore.getState().machine.status).toBe('IDLE')
  })
  it('discards extraction completing after a unit reset', async () => {
    let resolve!: (value: Awaited<ReturnType<typeof extractSilhouetteFromImage>>) => void
    vi.mocked(extractSilhouetteFromImage).mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    render(<FormLabMachine />)
    fireEvent.change(screen.getByLabelText('Insert reference silhouette'), {
      target: { files: [new File(['data'], 'shape.png')] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'RESET UNIT' }))
    await act(async () => resolve({ contour: [{ x: 0, y: 0 }], holes: [] }))
    expect(useMachineStore.getState().referenceUrl).toBeNull()
  })
  it.each(['MATERIALIZING', 'RENDERING', 'RETRIEVING', 'ERROR'] as const)(
    'locks edits during %s and prioritizes lifecycle feedback',
    (status) => {
      useMachineStore.setState({ machine: { ...useMachineStore.getState().machine, status } })
      render(<FormLabMachine />)
      expect(screen.getByRole('button', { name: 'Next material presets' })).toBeDisabled()
      const before = useMachineStore.getState().params
      act(() => {
        useMachineStore.getState().applyMaterial('candy')
        useMachineStore.getState().updateParam('gloss', 0.1)
      })
      expect(useMachineStore.getState().params).toBe(before)
      expect(document.querySelector('.crt-feedback')).toBeNull()
    },
  )
})
