'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Line as ThreeLine,
  LineBasicMaterial,
  MathUtils,
  MeshPhongMaterial,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from 'three'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { AmbientLight, DirectionalLight, Group, Mesh, PointLight } from 'three'
import { useTheme } from 'next-themes'

const EARTH_RADIUS = 2
const WIPE_SPEED = 0.7
const hubs = [
  [41.2995, 69.2401],
  [25.2048, 55.2708],
  [1.3521, 103.8198],
  [35.6762, 139.6503],
  [52.52, 13.405],
]

const dayGlow = new Color('#7dd3fc')
const nightGlow = new Color('#38bdf8')
const dayRouteA = new Color('#0ea5e9')
const nightRouteA = new Color('#63e6ff')
const dayRouteB = new Color('#059669')
const nightRouteB = new Color('#6ee7b7')
const dayHubMain = new Color('#0284c7')
const nightHubMain = new Color('#67e8f9')
const dayHub = new Color('#059669')
const nightHub = new Color('#6ee7b7')
const tmpColor = new Color()

type WipeState = {
  progress: number
  fromNight: number
  toNight: number
  visualNight: number
}

function coordinateToPoint([latitude, longitude]: number[], radius = EARTH_RADIUS) {
  const phi = ((90 - latitude) * Math.PI) / 180
  const theta = ((longitude + 180) * Math.PI) / 180

  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function Routes({ wipeRef }: { wipeRef: React.MutableRefObject<WipeState> }) {
  const routes = useMemo(
    () =>
      hubs.slice(1).map((hub, index) => {
        const start = coordinateToPoint(hubs[0], 2.045)
        const end = coordinateToPoint(hub, 2.045)
        const midpoint = start
          .clone()
          .add(end)
          .multiplyScalar(0.5)
          .normalize()
          .multiplyScalar(2.35 + index * 0.05)
        const curve = new CatmullRomCurve3([start, midpoint, end])
        const geometry = new BufferGeometry().setFromPoints(curve.getPoints(72))
        const material = new LineBasicMaterial({
          color: '#63e6ff',
          transparent: true,
          opacity: 0.24,
          blending: AdditiveBlending,
        })

        return { line: new ThreeLine(geometry, material), alt: index % 2 === 1 }
      }),
    [],
  )

  useFrame(() => {
    const t = wipeRef.current.visualNight
    routes.forEach(({ line, alt }) => {
      const material = line.material as LineBasicMaterial
      material.color.copy(alt ? dayRouteA : dayRouteB).lerp(alt ? nightRouteA : nightRouteB, t)
      material.opacity = MathUtils.lerp(0.32, 0.24, t)
    })
  })

  useEffect(
    () => () => {
      routes.forEach(({ line }) => {
        line.geometry.dispose()
        ;(line.material as LineBasicMaterial).dispose()
      })
    },
    [routes],
  )

  return (
    <>
      {routes.map(({ line }, index) => (
        <primitive key={index} object={line} />
      ))}
    </>
  )
}

function Atmosphere({ wipeRef }: { wipeRef: React.MutableRefObject<WipeState> }) {
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new Color('#38bdf8') },
      glowStrength: { value: 0.34 },
    }),
    [],
  )

  useFrame(() => {
    const t = wipeRef.current.visualNight
    uniforms.glowColor.value.copy(dayGlow).lerp(nightGlow, t)
    uniforms.glowStrength.value = MathUtils.lerp(0.22, 0.34, t)
  })

  return (
    <mesh scale={1.018}>
      <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vViewNormal;
          varying vec3 vViewPosition;

          void main() {
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            vViewNormal = normalize(normalMatrix * normal);
            vViewPosition = normalize(modelViewPosition.xyz);
            gl_Position = projectionMatrix * modelViewPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 glowColor;
          uniform float glowStrength;
          varying vec3 vViewNormal;
          varying vec3 vViewPosition;

          void main() {
            float rim = pow(max(0.0, 0.72 + dot(vViewNormal, vViewPosition)), 3.4);
            gl_FragColor = vec4(glowColor, rim * glowStrength);
          }
        `}
      />
    </mesh>
  )
}

function ThemeWipeDriver({
  wipeRef,
  targetNight,
}: {
  wipeRef: React.MutableRefObject<WipeState>
  targetNight: boolean
}) {
  const ready = useRef(false)
  const target = targetNight ? 1 : 0

  useEffect(() => {
    const state = wipeRef.current
    if (!ready.current) {
      state.progress = 1
      state.fromNight = target
      state.toNight = target
      state.visualNight = target
      ready.current = true
      return
    }
    if (Math.abs(state.toNight - target) < 0.001 && state.progress >= 0.999) return
    state.fromNight = state.visualNight
    state.toNight = target
    state.progress = 0
  }, [target, wipeRef])

  useFrame((_, delta) => {
    const state = wipeRef.current
    if (state.progress < 1) {
      state.progress = Math.min(1, state.progress + delta * WIPE_SPEED)
      const eased = state.progress * state.progress * (3 - 2 * state.progress)
      state.visualNight = MathUtils.lerp(state.fromNight, state.toNight, eased)
    } else {
      state.visualNight = state.toNight
      state.fromNight = state.toNight
    }
  })

  return null
}

function RealEarth({ wipeRef }: { wipeRef: React.MutableRefObject<WipeState> }) {
  const group = useRef<Group>(null)
  const clouds = useRef<Mesh>(null)
  const [dayMap, normalMap, specularMap, cloudMap, nightMap] = useLoader(TextureLoader, [
    '/images/earth/earth-day.jpg',
    '/images/earth/earth-normal.jpg',
    '/images/earth/earth-specular.jpg',
    '/images/earth/earth-clouds.png',
    '/images/earth/earth-night.png',
  ])

  useMemo(() => {
    dayMap.colorSpace = SRGBColorSpace
    cloudMap.colorSpace = SRGBColorSpace
    nightMap.colorSpace = SRGBColorSpace
    dayMap.anisotropy = 8
    normalMap.anisotropy = 8
    specularMap.anisotropy = 8
    cloudMap.anisotropy = 8
    nightMap.anisotropy = 8
  }, [cloudMap, dayMap, nightMap, normalMap, specularMap])

  const earthMaterial = useMemo(() => {
    const material = new ShaderMaterial({
      uniforms: {
        dayMap: { value: dayMap },
        nightMap: { value: nightMap },
        normalMap: { value: normalMap },
        specularMap: { value: specularMap },
        uProgress: { value: 1 },
        uFromNight: { value: 1 },
        uToNight: { value: 1 },
        uSoftness: { value: 0.18 },
        uLightDir: { value: new Vector3(0.55, 0.35, 0.75).normalize() },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying float vClipX;

        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vec4 mvPos = viewMatrix * worldPos;
          vec4 clip = projectionMatrix * mvPos;
          vClipX = clip.x / max(clip.w, 0.0001);
          vNormal = normalize(normalMatrix * normal);
          vViewPosition = -mvPos.xyz;
          gl_Position = clip;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayMap;
        uniform sampler2D nightMap;
        uniform sampler2D normalMap;
        uniform sampler2D specularMap;
        uniform float uProgress;
        uniform float uFromNight;
        uniform float uToNight;
        uniform float uSoftness;
        uniform vec3 uLightDir;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying float vClipX;

        vec3 tone(vec3 daySample, float nightFactor, vec3 cityLights, float specMask, vec3 normal) {
          vec3 albedo = mix(daySample, daySample * vec3(0.44, 0.53, 0.59), nightFactor);
          float ndl = max(dot(normal, normalize(uLightDir)), 0.0);
          float ambient = mix(0.42, 0.18, nightFactor);
          float diffuse = mix(0.85, 0.22, nightFactor) * ndl;
          vec3 lit = albedo * (ambient + diffuse);
          vec3 viewDir = normalize(vViewPosition);
          vec3 halfDir = normalize(uLightDir + viewDir);
          float spec = pow(max(dot(normal, halfDir), 0.0), mix(28.0, 8.0, nightFactor)) * specMask;
          lit += vec3(0.55, 0.78, 0.9) * spec * mix(0.55, 0.12, nightFactor);
          lit += cityLights * nightFactor * 1.35;
          return lit;
        }

        void main() {
          vec3 daySample = texture2D(dayMap, vUv).rgb;
          vec3 cityLights = texture2D(nightMap, vUv).rgb;
          float specMask = texture2D(specularMap, vUv).r;
          vec3 mapNormal = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
          vec3 normal = normalize(vNormal + mapNormal * 0.35);

          vec3 fromColor = tone(daySample, uFromNight, cityLights, specMask, normal);
          vec3 toColor = tone(daySample, uToNight, cityLights, specMask, normal);

          // Right -> left wipe: incoming theme covers from +X (right) toward -X (left)
          float threshold = mix(1.25, -1.25, clamp(uProgress, 0.0, 1.0));
          float incoming = smoothstep(threshold - uSoftness, threshold + uSoftness, vClipX);
          vec3 color = mix(fromColor, toColor, incoming);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
    return material
  }, [dayMap, nightMap, normalMap, specularMap])

  const cloudMaterial = useMemo(
    () =>
      new MeshPhongMaterial({
        map: cloudMap,
        transparent: true,
        color: '#a3bdc9',
        opacity: 0.3,
        depthWrite: false,
        shininess: 1,
      }),
    [cloudMap],
  )

  const markerMaterials = useMemo(
    () =>
      hubs.map((_, index) =>
        new MeshPhongMaterial({
          color: (index === 0 ? nightHubMain : nightHub).clone(),
          emissive: (index === 0 ? nightHubMain : nightHub).clone(),
          emissiveIntensity: 0.35,
        }),
      ),
    [],
  )

  useEffect(
    () => () => {
      earthMaterial.dispose()
      cloudMaterial.dispose()
      markerMaterials.forEach((material) => material.dispose())
    },
    [cloudMaterial, earthMaterial, markerMaterials],
  )

  useFrame((state, delta) => {
    const wipe = wipeRef.current
    const eased = wipe.progress * wipe.progress * (3 - 2 * wipe.progress)

    earthMaterial.uniforms.uProgress.value = eased
    earthMaterial.uniforms.uFromNight.value = wipe.fromNight
    earthMaterial.uniforms.uToNight.value = wipe.toNight

    const t = wipe.visualNight
    cloudMaterial.color.setRGB(
      MathUtils.lerp(1, 0.64, t),
      MathUtils.lerp(1, 0.74, t),
      MathUtils.lerp(1, 0.79, t),
    )
    cloudMaterial.opacity = MathUtils.lerp(0.42, 0.3, t)

    markerMaterials.forEach((material, index) => {
      const from = index === 0 ? dayHubMain : dayHub
      const to = index === 0 ? nightHubMain : nightHub
      material.color.copy(from).lerp(to, t)
      material.emissive.copy(tmpColor.copy(from).lerp(to, t))
    })

    if (group.current) {
      group.current.rotation.y += delta * 0.035
      group.current.rotation.x +=
        (0.16 + state.pointer.y * 0.09 - group.current.rotation.x) * 0.025
      group.current.rotation.z +=
        (-0.08 - state.pointer.x * 0.04 - group.current.rotation.z) * 0.025
    }
    if (clouds.current) clouds.current.rotation.y += delta * 0.012
  })

  return (
    <group ref={group} rotation={[0.16, -1.55, -0.08]}>
      <mesh material={earthMaterial}>
        <sphereGeometry args={[EARTH_RADIUS, 128, 128]} />
      </mesh>

      <mesh ref={clouds} scale={1.008} material={cloudMaterial}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
      </mesh>

      <Routes wipeRef={wipeRef} />
      {hubs.map((hub, index) => (
        <mesh key={index} position={coordinateToPoint(hub, 2.055)} material={markerMaterials[index]}>
          <sphereGeometry args={[index === 0 ? 0.042 : 0.026, 16, 16]} />
        </mesh>
      ))}
      <Atmosphere wipeRef={wipeRef} />
    </group>
  )
}

function GlobeLights({ wipeRef }: { wipeRef: React.MutableRefObject<WipeState> }) {
  const ambient = useRef<AmbientLight>(null)
  const sun = useRef<DirectionalLight>(null)
  const fill = useRef<DirectionalLight>(null)
  const accent = useRef<PointLight>(null)

  const ambientDay = useMemo(() => new Color('#cfe8ff'), [])
  const ambientNight = useMemo(() => new Color('#8bb1c5'), [])
  const sunDay = useMemo(() => new Color('#fff7e6'), [])
  const sunNight = useMemo(() => new Color('#d1eaf4'), [])
  const fillDay = useMemo(() => new Color('#93c5fd'), [])
  const fillNight = useMemo(() => new Color('#000000'), [])
  const accentDay = useMemo(() => new Color('#38bdf8'), [])
  const accentNight = useMemo(() => new Color('#64cbed'), [])

  useFrame(() => {
    const t = wipeRef.current.visualNight

    if (ambient.current) {
      ambient.current.color.copy(ambientDay).lerp(ambientNight, t)
      ambient.current.intensity = MathUtils.lerp(0.55, 0.31, t)
    }
    if (sun.current) {
      sun.current.color.copy(sunDay).lerp(sunNight, t)
      sun.current.intensity = MathUtils.lerp(1.45, 0.6, t)
      sun.current.position.set(
        MathUtils.lerp(5, 4.5, t),
        MathUtils.lerp(3.5, 3, t),
        MathUtils.lerp(4, 5, t),
      )
    }
    if (fill.current) {
      fill.current.color.copy(fillDay).lerp(fillNight, t)
      fill.current.intensity = MathUtils.lerp(0.35, 0, t)
    }
    if (accent.current) {
      accent.current.color.copy(accentDay).lerp(accentNight, t)
      accent.current.intensity = MathUtils.lerp(0.25, 0.34, t)
      accent.current.position.set(
        MathUtils.lerp(-2, -4, t),
        MathUtils.lerp(2, -2, t),
        MathUtils.lerp(3, 1, t),
      )
    }
  })

  return (
    <>
      <ambientLight ref={ambient} color="#8bb1c5" intensity={0.31} />
      <directionalLight ref={sun} color="#d1eaf4" position={[4.5, 3, 5]} intensity={0.6} />
      <directionalLight ref={fill} color="#93c5fd" position={[-3, 1, -2]} intensity={0} />
      <pointLight ref={accent} color="#64cbed" position={[-4, -2, 1]} intensity={0.34} />
    </>
  )
}

function GlobeFallback({ night }: { night: boolean }) {
  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
      <meshPhongMaterial color={night ? '#12364a' : '#1d6fa5'} shininess={8} />
    </mesh>
  )
}

function Scene({ targetNight }: { targetNight: boolean }) {
  const wipeRef = useRef<WipeState>({
    progress: 1,
    fromNight: targetNight ? 1 : 0,
    toNight: targetNight ? 1 : 0,
    visualNight: targetNight ? 1 : 0,
  })

  return (
    <>
      <ThemeWipeDriver wipeRef={wipeRef} targetNight={targetNight} />
      <GlobeLights wipeRef={wipeRef} />
      <Suspense fallback={<GlobeFallback night={targetNight} />}>
        <RealEarth wipeRef={wipeRef} />
      </Suspense>
    </>
  )
}

export default function Globe() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const night = !mounted || resolvedTheme !== 'light'

  return (
    <div className={'globe-canvas ' + (night ? 'is-night' : 'is-day')}>
      <Canvas
        dpr={[1, 1.7]}
        camera={{ position: [0, 0, 7], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Scene targetNight={night} />
      </Canvas>
      <div className="globe-hud">
        <i />
        <span>{night ? 'LIVE EARTH / NIGHT' : 'LIVE EARTH / DAY'} · 41.2995 N</span>
      </div>
    </div>
  )
}
