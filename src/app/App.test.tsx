import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App'

describe('App', () => {
  it('renders the FORM//LAB machine identity', () => {
    render(<App />)
    expect(screen.getAllByText(/FORM\/\/LAB/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/INFLATION & MATERIALIZATION UNIT/i).length).toBeGreaterThan(0)
  })

  it('shows the idle dispenser as offline', () => {
    render(<App />)
    expect(screen.getByText(/DISPENSER OFFLINE/i)).toBeInTheDocument()
  })
})
