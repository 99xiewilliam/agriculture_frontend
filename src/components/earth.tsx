'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import * as THREE from 'three'
import { COUNTIES_IL } from '@/data/counties_il'
import type { County } from '@/types/region'
import { useAppStore } from '@/store/appStore'

const Globe = dynamic(() => import('react-globe.gl').then(mod => mod.default as any), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
  ),
}) as any

type GlobeInstance = {
  controls: () => {
    autoRotate: boolean
    autoRotateSpeed: number
  }
  pointOfView: (coords: { lat: number; lng: number; altitude: number }, ms: number) => void
}

type EarthBackgroundProps = {
  className?: string
  onGlobeClick?: (coords: { lat: number; lng: number }) => void
}

const fallbackCartesian = (lat: number, lng: number, radius: number, altitude = 0) => {
  const r = radius * (1 + altitude)
  const latRad = THREE.MathUtils.degToRad(lat)
  const lonRad = THREE.MathUtils.degToRad(lng)
  const cosLat = Math.cos(latRad)
  return new THREE.Vector3(
    r * cosLat * Math.sin(lonRad),
    r * Math.sin(latRad),
    r * cosLat * Math.cos(lonRad)
  )
}

function EarthBackgroundComponent({ className = '', onGlobeClick }: EarthBackgroundProps) {
  const globeRef = useRef<GlobeInstance | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [clickRings, setClickRings] = useState<Array<{ lat: number; lng: number; id: number }>>([])
  const controlsRef = useRef<any | null>(null)
  const handleEndRef = useRef<() => void>(() => {})
  const handleStartRef = useRef<() => void>(() => {})
  const initializedRef = useRef<boolean>(false)
  const [hoverInfo, setHoverInfo] = useState<{ county: County; position: { x: number; y: number } } | null>(null)
  const selectedFips = useAppStore((state) => state.selectedRegion.fips)
  const FLAG_ALTITUDE = 0.01
  const resumeTimerRef = useRef<number | null>(null)

  const getGlobePosition = useCallback(
    (lat: number, lng: number, altitude = 0) => {
      const globe = globeRef.current as any
      if (globe?.getCoords) {
        const vec = globe.getCoords(lat, lng, altitude)
        return vec.clone ? vec.clone() : new THREE.Vector3(vec.x, vec.y, vec.z)
      }
      const radius = globe?.getGlobeRadius?.() ?? 100
      return fallbackCartesian(lat, lng, radius, altitude)
    },
    []
  )

  const updateHoverTooltip = useCallback(
    (county: County | null) => {
      if (!county) {
        setHoverInfo(null)
        return
      }
      const globe = globeRef.current as any
      const coords = globe?.toScreenCoords?.({
        lat: county.centroid[0],
        lng: county.centroid[1],
        altitude: FLAG_ALTITUDE,
      })
      const rect = containerRef.current?.getBoundingClientRect()
      if (coords && rect) {
        setHoverInfo({
          county,
          position: {
            x: coords.x - rect.left,
            y: coords.y - rect.top,
          },
        })
      } else {
        setHoverInfo({
          county,
          position: { x: 0, y: 0 },
        })
      }
    },
    [FLAG_ALTITUDE]
  )

  const setGlobeInstance = useCallback((instance: GlobeInstance | null) => {
    globeRef.current = instance
    if (!instance) return
    if (initializedRef.current) return
    const controls = instance.controls() as any
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.6
    const resumeAutoRotate = () => {
      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current)
      }
      resumeTimerRef.current = window.setTimeout(() => {
        controls.autoRotate = true
      }, 3000)
    }

    const pauseAutoRotate = () => {
      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current)
        resumeTimerRef.current = null
      }
      controls.autoRotate = false
    }

    controls.addEventListener?.('start', pauseAutoRotate)
    controls.addEventListener?.('end', resumeAutoRotate)
    controlsRef.current = controls
    handleEndRef.current = resumeAutoRotate
    handleStartRef.current = pauseAutoRotate
    instance.pointOfView({ lat: 23, lng: 110, altitude: 2.4 }, 0)
    initializedRef.current = true
  }, [])

  // 清理事件监听
  useEffect(() => {
    return () => {
      const controls = controlsRef.current
      controls?.removeEventListener?.('end', handleEndRef.current)
      controls?.removeEventListener?.('start', handleStartRef.current)
      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current)
      }
    }
  }, [])

  // 可靠性增强：延时与保活，避免库初始化时机导致 autoRotate 未生效
  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return
    const kick = () => {
      const c = globe.controls() as any
      if (c) {
        c.autoRotate = true
        c.autoRotateSpeed = 0.6
      }
    }
    const t1 = window.setTimeout(kick, 120)
    const interval = window.setInterval(kick, 2000)
    return () => {
      window.clearTimeout(t1)
      window.clearInterval(interval)
    }
  }, [])
  const handleGlobeClick = ({ lat, lng }: { lat: number; lng: number }) => {
    const id = Date.now()
    setClickRings(prev => [...prev, { lat, lng, id }])
    // 清理该次点击的波纹数据（与 ringRepeatPeriod/propagationSpeed 对齐，适当冗余）
    window.setTimeout(() => {
      setClickRings(prev => prev.filter(r => r.id !== id))
    }, 2200)
    handleStartRef.current?.()
    handleEndRef.current?.()
    onGlobeClick?.({ lat, lng })
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 背景层：浅色渐变与柔和色块光晕 */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-100" />
      <div className="absolute -top-24 -left-24 z-0 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 z-0 w-[28rem] h-[28rem] rounded-full bg-sky-300/20 blur-3xl" />
      {/* 调整地球位置：通过负边距和更大的尺寸来左移并微调垂直位置，同时确保覆盖全屏 */}
      <div className="absolute z-10" style={{ left: '-50%', top: '-10%', width: '160%', height: '140%', filter: 'brightness(1.08) saturate(1.05)' }}>
        <Globe
          ref={setGlobeInstance as any}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor="#38bdf8"
          atmosphereAltitude={0.12}
          width={undefined}
          height={undefined}
          polygonsData={[]}
          onGlobeClick={handleGlobeClick}
          // 自定义 3D 旗帜（以县质心为锚点）
          customLayerData={COUNTIES_IL as any}
          customThreeObject={(d: any) => {
            const group = new THREE.Group()
            const radius =
              (globeRef.current as any)?.getGlobeRadius?.() ?? 100
            const scale = radius * 0.035
            const baseHeight = scale * 0.15
            const baseRadius = scale * 0.09
            const poleHeight = scale * 0.8
            const poleRadius = scale * 0.035
            const flagWidth = scale * 0.6
            const flagHeight = scale * 0.36
            const flagThickness = scale * 0.08

            const base = new THREE.Mesh(
              new THREE.ConeGeometry(baseRadius, baseHeight, 24),
              new THREE.MeshBasicMaterial({ color: '#475569' })
            )
            base.position.y = baseHeight / 2

            const pole = new THREE.Mesh(
              new THREE.CylinderGeometry(poleRadius, poleRadius, poleHeight, 24),
              new THREE.MeshBasicMaterial({ color: '#334155' })
            )
            pole.position.y = baseHeight + poleHeight / 2

            const flag = new THREE.Mesh(
              new THREE.BoxGeometry(flagWidth, flagHeight, flagThickness),
              new THREE.MeshBasicMaterial({ color: '#dc2626' })
            )
            flag.position.set(flagWidth / 2, baseHeight + poleHeight * 0.92, 0)
            flag.rotateZ(-Math.PI / 20)

            const hitZone = new THREE.Mesh(
              new THREE.SphereGeometry(scale * 0.45, 16, 16),
              new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
            )
            hitZone.position.set(flagWidth / 4, baseHeight + poleHeight * 0.7, 0)

            const sharedData = {
              county: d,
              flag,
              pole,
              base,
            }

            const disableRaycast = (obj: any) => {
              obj.raycast = () => null
            }

            ;[group, base, pole, flag, hitZone].forEach((obj) => {
              obj.userData = sharedData
              ;(obj as any).__county = d
              disableRaycast(obj)
            })

            group.add(base, pole, flag, hitZone)
            return group
          }}
          customThreeObjectExtend={true}
          customThreeObjectUpdate={(obj: any, d: any) => {
            const [lat, lng] = d.centroid
            const pos = getGlobePosition(lat, lng, FLAG_ALTITUDE)
            obj.position.copy(pos)
            const radial = pos.clone().normalize()
            const quat = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              radial
            )
            obj.setRotationFromQuaternion(quat)

            const sharedData = obj.userData || {}
            const isSelected = Boolean(selectedFips && d.fips === selectedFips)

            const flagMesh = sharedData.flag as any
            if (flagMesh) {
              const material = flagMesh.material as any
              material.color.set(isSelected ? '#f43f5e' : '#dc2626')
              material.opacity = isSelected ? 1 : 0.95
              material.needsUpdate = true
            }

            const poleMesh = sharedData.pole as any
            if (poleMesh) {
              const material = poleMesh.material as any
              material.color.set(isSelected ? '#0f172a' : '#334155')
              material.needsUpdate = true
            }

            obj.scale.setScalar(isSelected ? 1.1 : 1)
          }}
          labelsData={COUNTIES_IL as any}
          labelLat={(d: County) => d.centroid[0]}
          labelLng={(d: County) => d.centroid[1]}
          labelAltitude={FLAG_ALTITUDE + 0.01}
          labelText={() => ' '}
          labelSize={1}
          labelDotRadius={0.5}
          labelColor={() => 'rgba(0,0,0,0.001)'}
          onLabelClick={(county: County | null, _event: any, coords: { lat: number; lng: number }) => {
            if (county) {
              handleGlobeClick({ lat: county.centroid[0], lng: county.centroid[1] })
            } else if (coords) {
              handleGlobeClick(coords)
            }
          }}
          onLabelHover={(county: County | null) => {
            updateHoverTooltip(county ?? null)
          }}
          // 点击波纹特效
          ringsData={clickRings}
          ringAltitude={0.035}
          ringMaxRadius={8}
          ringPropagationSpeed={2.2}
          ringRepeatPeriod={900}
          ringColor={() => (t: number) => `rgba(215, 0, 15, ${0.95 * Math.pow(1 - t, 0.5)})`}
        />
      </div>

      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-white/10 via-transparent to-white/20" />
      {hoverInfo && (
        <div
          className="absolute z-30 pointer-events-none px-3 py-1.5 bg-white/95 rounded-full border border-gray-200 shadow-lg text-xs font-semibold text-gray-900"
          style={{
            left: hoverInfo.position.x,
            top: hoverInfo.position.y - 10,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {hoverInfo.county.name} County
        </div>
      )}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 text-xs tracking-[0.35em] uppercase text-slate-700/60 pointer-events-none">
        GeoTARS - Global Agriculture Insight
      </div>
    </div>
  )
}

const EarthBackground = memo(EarthBackgroundComponent)
export default EarthBackground
