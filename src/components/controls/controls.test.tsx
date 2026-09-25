import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MechanicalSlider } from './MechanicalSlider'
import { PushButton } from './PushButton'
import { RotaryKnob } from './RotaryKnob'
import { SelectorSwitch } from './SelectorSwitch'
import { ToggleSwitch } from './ToggleSwitch'

describe('physical controls — semantics & keyboard', () => {
  it('RotaryKnob is a slider and responds to arrow keys', () => {
    const onChange = vi.fn()
    render(<RotaryKnob label="AIR PRESSURE" value={0.5} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: /air pressure/i })
    expect(slider).toHaveAttribute('aria-valuenow', '50')
    fireEvent.keyDown(slider, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenCalledWith(0.55)
    fireEvent.keyDown(slider, { key: 'Home' })
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('ToggleSwitch exposes switch semantics and toggles', () => {
    const onChange = vi.fn()
    render(<ToggleSwitch label="LIVE PREVIEW" checked={false} onChange={onChange} />)
    const toggle = screen.getByRole('switch', { name: /live preview/i })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(toggle)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('MechanicalSlider is a slider and responds to arrow keys', () => {
    const onChange = vi.fn()
    render(<MechanicalSlider label="CREASE DENSITY" value={0.4} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: /crease density/i })
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(0.45)
  })

  it('SelectorSwitch is a radiogroup and reports selection', () => {
    const onChange = vi.fn()
    render(
      <SelectorSwitch
        label="TRANSPARENCY"
        options={[
          { value: 'opaque', label: 'OPAQUE' },
          { value: 'clear', label: 'CLEAR' },
        ]}
        value="opaque"
        onChange={onChange}
      />,
    )
    expect(screen.getByRole('radiogroup', { name: /transparency/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: /clear/i }))
    expect(onChange).toHaveBeenCalledWith('clear')
  })

  it('PushButton renders an accessible, labelled button', () => {
    const onClick = vi.fn()
    render(<PushButton onClick={onClick}>MATERIALIZE</PushButton>)
    const button = screen.getByRole('button', { name: 'MATERIALIZE' })
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it('PushButton respects the disabled attribute', () => {
    render(<PushButton disabled>RETRIEVE OBJECT</PushButton>)
    expect(screen.getByRole('button', { name: 'RETRIEVE OBJECT' })).toBeDisabled()
  })
})
