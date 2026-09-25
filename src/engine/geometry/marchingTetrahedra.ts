import { cross3, dot3, normalize3, sub3, v3, type Vec3 } from './vec'

export interface MeshData {
  positions: Float32Array
  normals: Float32Array
  uvs: Float32Array
  indices: Uint32Array
}

export interface Bounds {
  x: [number, number]
  y: [number, number]
  z: [number, number]
}

type Sampler = (x: number, y: number, z: number) => number

const CORNERS: readonly [number, number, number][] = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 1],
]

// Six tetrahedra sharing the 0–6 diagonal of the cube.
const TETS: readonly [number, number, number, number][] = [
  [0, 5, 1, 6],
  [0, 1, 2, 6],
  [0, 2, 3, 6],
  [0, 3, 7, 6],
  [0, 7, 4, 6],
  [0, 4, 5, 6],
]

function sampleGradient(sample: Sampler, x: number, y: number, z: number, eps: number): Vec3 {
  const dx = sample(x + eps, y, z) - sample(x - eps, y, z)
  const dy = sample(x, y + eps, z) - sample(x, y - eps, z)
  const dz = sample(x, y, z + eps) - sample(x, y, z - eps)
  return normalize3(v3(dx, dy, dz))
}

/**
 * Extract an isosurface from an implicit function using marching tetrahedra.
 * Chosen over marching cubes because it needs no large lookup tables and is
 * straightforward to keep correct. Vertex normals are accumulated from
 * gradient-oriented triangles, giving smooth shading regardless of winding.
 */
export function extractSurface(
  sample: Sampler,
  bounds: Bounds,
  counts: { x: number; y: number; z: number },
  iso = 0,
): MeshData {
  const { x: nx, y: ny, z: nz } = counts
  const x0 = bounds.x[0]
  const y0 = bounds.y[0]
  const z0 = bounds.z[0]
  const sx = (bounds.x[1] - x0) / nx
  const sy = (bounds.y[1] - y0) / ny
  const sz = (bounds.z[1] - z0) / nz

  const spanX = nx + 1
  const spanY = ny + 1
  const values = new Float32Array(spanX * spanY * (nz + 1))
  const at = (i: number, j: number, k: number) => (k * spanY + j) * spanX + i

  for (let k = 0; k <= nz; k++) {
    for (let j = 0; j <= ny; j++) {
      for (let i = 0; i <= nx; i++) {
        values[at(i, j, k)] = sample(x0 + i * sx, y0 + j * sy, z0 + k * sz)
      }
    }
  }

  const gridPos = (i: number, j: number, k: number): Vec3 =>
    v3(x0 + i * sx, y0 + j * sy, z0 + k * sz)

  // Collect triangles as flat vertex triples.
  const triPoints: Vec3[] = []

  // Interpolated point on an edge where the field crosses `iso`.
  const edgePoint = (pa: Vec3, va: number, pb: Vec3, vb: number): Vec3 => {
    const denom = vb - va
    const t = Math.abs(denom) < 1e-9 ? 0.5 : (iso - va) / denom
    return v3(pa.x + (pb.x - pa.x) * t, pa.y + (pb.y - pa.y) * t, pa.z + (pb.z - pa.z) * t)
  }

  const polygonize = (
    p: [Vec3, Vec3, Vec3, Vec3],
    v: [number, number, number, number],
  ) => {
    const inside: number[] = []
    const outside: number[] = []
    for (let c = 0; c < 4; c++) (v[c] < iso ? inside : outside).push(c)
    if (inside.length === 0 || inside.length === 4) return

    const crossings: Vec3[] = []
    // Every in/out corner pair forms a crossing edge.
    for (const a of inside) {
      for (const b of outside) {
        crossings.push(edgePoint(p[a], v[a], p[b], v[b]))
      }
    }

    if (crossings.length === 3) {
      triPoints.push(crossings[0], crossings[1], crossings[2])
    } else if (crossings.length === 4) {
      triPoints.push(crossings[0], crossings[1], crossings[2])
      triPoints.push(crossings[0], crossings[2], crossings[3])
    }
  }

  const cp: [Vec3, Vec3, Vec3, Vec3] = [v3(0, 0, 0), v3(0, 0, 0), v3(0, 0, 0), v3(0, 0, 0)]
  const cv: [number, number, number, number] = [0, 0, 0, 0]
  const eps = Math.min(sx, sy, sz) * 0.5

  for (let k = 0; k < nz; k++) {
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        for (const tet of TETS) {
          for (let c = 0; c < 4; c++) {
            const corner = CORNERS[tet[c]]
            const gi = i + corner[0]
            const gj = j + corner[1]
            const gk = k + corner[2]
            cp[c] = gridPos(gi, gj, gk)
            cv[c] = values[at(gi, gj, gk)]
          }
          polygonize(cp, cv)
        }
      }
    }
  }

  // Build an indexed, smooth-shaded mesh.
  const vertexMap = new Map<string, number>()
  const positions: number[] = []
  const normalAccum: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const vertexIndex = (point: Vec3): number => {
    const key = `${Math.round(point.x * 1e5)}_${Math.round(point.y * 1e5)}_${Math.round(point.z * 1e5)}`
    const existing = vertexMap.get(key)
    if (existing !== undefined) return existing
    const index = positions.length / 3
    vertexMap.set(key, index)
    positions.push(point.x, point.y, point.z)
    normalAccum.push(0, 0, 0)
    uvs.push(point.x, point.y)
    return index
  }

  for (let t = 0; t < triPoints.length; t += 3) {
    const a = triPoints[t]
    const b = triPoints[t + 1]
    const c = triPoints[t + 2]

    // Orient the triangle so its face normal points along +gradient (outward).
    let faceNormal = cross3(sub3(b, a), sub3(c, a))
    const centroid = v3((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3)
    const grad = sampleGradient(sample, centroid.x, centroid.y, centroid.z, eps)
    let va = a
    let vb = b
    let vc = c
    if (dot3(faceNormal, grad) < 0) {
      va = a
      vb = c
      vc = b
      faceNormal = cross3(sub3(vb, va), sub3(vc, va))
    }

    const ia = vertexIndex(va)
    const ib = vertexIndex(vb)
    const ic = vertexIndex(vc)
    indices.push(ia, ib, ic)

    for (const idx of [ia, ib, ic]) {
      normalAccum[idx * 3] += faceNormal.x
      normalAccum[idx * 3 + 1] += faceNormal.y
      normalAccum[idx * 3 + 2] += faceNormal.z
    }
  }

  const normals = new Float32Array(normalAccum.length)
  for (let i = 0; i < normalAccum.length; i += 3) {
    const n = normalize3(v3(normalAccum[i], normalAccum[i + 1], normalAccum[i + 2]))
    normals[i] = n.x
    normals[i + 1] = n.y
    normals[i + 2] = n.z
  }

  return {
    positions: new Float32Array(positions),
    normals,
    uvs: new Float32Array(uvs),
    indices: new Uint32Array(indices),
  }
}
