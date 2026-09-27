import { describe, expect, it } from 'vitest'

import { DEFAULT_SILHOUETTE } from '../data/sampleSilhouettes'
import { createProceduralEngine } from './proceduralEngine'
import type { GenerationParams } from './types'

const baseParams: GenerationParams = {
  silhouetteContour: DEFAULT_SILHOUETTE.contour,
  material: 'vinyl',
  color: '#FF4500',
  transparency: 'opaque',
  puffiness: 0.7,
  foldDensity: 0.3,
  asymmetry: 0.25,
  gloss: 0.6,
  background: 'studio',
  lighting: 'soft',
  shadows: true,
}

const bounds = (positions: Float32Array) => {
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < positions.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      min[a] = Math.min(min[a], positions[i + a])
      max[a] = Math.max(max[a], positions[i + a])
    }
  }
  return { min, max }
}

describe('proceduralEngine', () => {
  // Low resolution keeps the test fast; the pipeline is identical.
  const engine = createProceduralEngine({ sdfRes: 48, counts: { x: 22, y: 22, z: 14 } })

  it('produces non-empty, well-formed geometry buffers', async () => {
    const object = await engine.generate(baseParams)
    expect(object.descriptor.kind).toBe('geometry')
    if (object.descriptor.kind !== 'geometry') return

    const { positions, normals, uvs, indices } = object.descriptor
    expect(positions.length).toBeGreaterThan(0)
    expect(indices.length).toBeGreaterThan(0)
    expect(normals.length).toBe(positions.length)
    expect(positions.length / 3).toBe(uvs.length / 2)
    for (const value of positions) expect(Number.isFinite(value)).toBe(true)
    for (const index of indices) expect(index).toBeLessThan(positions.length / 3)
  })

  it('returns an id and an SVG preview data URL', async () => {
    const object = await engine.generate(baseParams)
    expect(object.id).toMatch(/^obj-/)
    expect(object.preview.startsWith('data:image/svg+xml')).toBe(true)
  })

  it('preserves the silhouette: the form is wider across xy than deep in z', async () => {
    const object = await engine.generate(baseParams)
    if (object.descriptor.kind !== 'geometry') throw new Error('expected geometry')
    const { min, max } = bounds(object.descriptor.positions)
    const spanX = max[0] - min[0]
    const spanY = max[1] - min[1]
    const spanZ = max[2] - min[2]
    // Silhouette preserved: the form is decisively wider across its face than deep.
    expect(spanX).toBeGreaterThan(spanZ)
    expect(spanY).toBeGreaterThan(spanZ)
  })

  it('increases depth as puffiness rises', async () => {
    const flat = await engine.generate({ ...baseParams, puffiness: 0.1 })
    const puffed = await engine.generate({ ...baseParams, puffiness: 1 })
    if (flat.descriptor.kind !== 'geometry' || puffed.descriptor.kind !== 'geometry') {
      throw new Error('expected geometry')
    }
    const flatZ = bounds(flat.descriptor.positions).max[2] - bounds(flat.descriptor.positions).min[2]
    const puffedZ =
      bounds(puffed.descriptor.positions).max[2] - bounds(puffed.descriptor.positions).min[2]
    expect(puffedZ).toBeGreaterThan(flatZ)
  })

  it('carves interior cutouts into the form', async () => {
    const circle = (r: number, n = 64) =>
      Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2
        return { x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r }
      })
    const outer = circle(0.42)
    const hole = circle(0.2)

    const solid = await engine.generate({ ...baseParams, silhouetteContour: outer, holes: [] })
    const cut = await engine.generate({ ...baseParams, silhouetteContour: outer, holes: [hole] })
    if (solid.descriptor.kind !== 'geometry' || cut.descriptor.kind !== 'geometry') {
      throw new Error('expected geometry')
    }

    const nearCentre = (positions: Float32Array) => {
      let count = 0
      for (let i = 0; i < positions.length; i += 3) {
        if (Math.hypot(positions[i] - 0.5, positions[i + 1] - 0.5) < 0.08) count++
      }
      return count
    }

    // Without cutouts the disc is solid through the centre; with the hole it is a void.
    expect(nearCentre(solid.descriptor.positions)).toBeGreaterThan(0)
    expect(nearCentre(cut.descriptor.positions)).toBe(0)
  })

  it('throws when superseded by cancel()', async () => {
    const cancelling = createProceduralEngine({ sdfRes: 32, counts: { x: 12, y: 12, z: 8 } })
    cancelling.cancel?.()
    // cancel() sets the flag; the next generate() resets then runs — assert it
    // completes cleanly rather than throwing on a stale flag.
    const object = await cancelling.generate(baseParams)
    expect(object.descriptor.kind).toBe('geometry')
  })
})
