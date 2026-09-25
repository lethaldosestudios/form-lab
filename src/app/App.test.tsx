import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App'

describe('App', () => {
  it('renders the FORM//LAB identity', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /form\/\/lab/i })).toBeInTheDocument()
    expect(screen.getByText(/MODEL IM-01/i)).toBeInTheDocument()
  })
})
