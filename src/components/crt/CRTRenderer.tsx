import { ContactShadows } from '@react-three/drei'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import type { BackgroundMode, LightingMode, RenderedObject } from '../../engine/types'
import type { ObjectAppearance } from '../../state/appearance'

interface CRTRendererProps {
  object: RenderedObject
  appearance: ObjectAppearance
  background: BackgroundMode
  lighting: LightingMode
  shadows: boolean
}

const BACKGROUND_COLOR: Record<BackgroundMode, string> = {
  studio: '#111318',
  void: '#010203',
  grid: '#05070a',
  gradient: '#0b0e13',
}

const LIGHTING: Record<
  LightingMode,
  {
    ambient: number
    key: { intensity: number; position: [number, number, number] }
    fill?: { intensity: number; position: [number, number, number] }
    rim?: { intensity: number; position: [number, number, number] }
  }
> = {
  soft: {
    ambient: 0.55,
    key: { intensity: 1.15, position: [3, 4, 3] },
    fill: { intensity: 0.4, position: [-3, 1, 2] },
  },
  directional: {
    ambient: 0.25,
    key: { intensity: 1.9, position: [2, 5, 2] },
  },
  dramatic: {
    ambient: 0.12,
    key: { intensity: 2.3, position: [3, 3, -2] },
    rim: { intensity: 1.3, position: [-3, 1, -3] },
  },
}

function GeometryObject({ object, appearance }: { object: RenderedObject; appearance: ObjectAppearance }) {
  const geometry = useMemo(() => {
    if (object.descriptor.kind !== 'geometry') return null
    const d = object.descriptor
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(d.positions, 3))
    g.setAttribute('normal', new THREE.BufferAttribute(d.normals, 3))
    g.setAttribute('uv', new THREE.BufferAttribute(d.uvs, 2))
    g.setIndex(new THREE.BufferAttribute(d.indices, 1))
    g.center()
    g.computeBoundingSphere()
    return g
  }, [object])

  useEffect(() => {
    return () => {
      geometry?.dispose()
    }
  }, [geometry])

  if (!geometry) return null
  const radius = geometry.boundingSphere?.radius ?? 0.6
  const scale = 1.35 / Math.max(radius, 1e-3)

  return (
    <mesh geometry={geometry} scale={scale} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={appearance.color}
        roughness={appearance.roughness}
        metalness={appearance.metalness}
        transmission={appearance.transmission}
        thickness={0.65}
        ior={1.4}
        opacity={appearance.opacity}
        transparent={appearance.opacity < 1 || appearance.transmission > 0.02}
        clearcoat={appearance.sheen}
        clearcoatRoughness={0.16}
      />
    </mesh>
  )
}

function ImageObject({ dataURL }: { dataURL: string }) {
  const texture = useLoader(THREE.TextureLoader, dataURL)
  return (
    <mesh>
      <planeGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  )
}

function ObjectStage({ object, appearance }: { object: RenderedObject; appearance: ObjectAppearance }) {
  const group = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.32
  })
  return (
    <group ref={group}>
      {object.descriptor.kind === 'geometry' ? (
        <GeometryObject object={object} appearance={appearance} />
      ) : (
        <Suspense fallback={null}>
          <ImageObject dataURL={object.descriptor.dataURL} />
        </Suspense>
      )}
    </group>
  )
}

/**
 * The CRT's WebGL scene. This is the ONLY module that imports Three.js — the
 * engine emits neutral geometry, and only this renderer turns it into meshes
 * (engineering spec §4, §5).
 */
export function CRTRenderer({ object, appearance, background, lighting, shadows }: CRTRendererProps) {
  const light = LIGHTING[lighting]

  return (
    <Canvas
      className="crt-renderer"
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [0, 0.15, 2.4], fov: 34 }}
    >
      <color attach="background" args={[BACKGROUND_COLOR[background]]} />
      <ambientLight intensity={light.ambient} />
      <directionalLight
        intensity={light.key.intensity}
        position={light.key.position}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {light.fill && <directionalLight intensity={light.fill.intensity} position={light.fill.position} />}
      {light.rim && <directionalLight intensity={light.rim.intensity} position={light.rim.position} />}

      {background === 'grid' && (
        <gridHelper args={[7, 14, '#162622', '#0c1512']} position={[0, -1.15, 0]} />
      )}

      <ObjectStage object={object} appearance={appearance} />

      {shadows && (
        <ContactShadows
          position={[0, -1.12, 0]}
          opacity={0.55}
          scale={4.2}
          blur={2.6}
          far={2}
          color="#000000"
        />
      )}
    </Canvas>
  )
}
