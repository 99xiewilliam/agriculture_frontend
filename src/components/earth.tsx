'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
  ),
})

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

export default function EarthBackground({ className = '', onGlobeClick }: EarthBackgroundProps) {
  const globeRef = useRef<GlobeInstance | null>(null)

  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    const controls = globe.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.35

    globe.pointOfView({ lat: 23, lng: 110, altitude: 2.4 }, 0)
  }, [])

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 调整地球位置：通过负边距和更大的尺寸来左移并微调垂直位置，同时确保覆盖全屏 */}
      <div className="absolute" style={{ left: '-50%', top: '-10%', width: '160%', height: '140%' }}>
        <Globe
          ref={globeRef as any}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor="#38bdf8"
          atmosphereAltitude={0.12}
          width={undefined}
          height={undefined}
          polygonsData={[]}
          onGlobeClick={onGlobeClick}
        />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-900/70 via-slate-950/40 to-slate-900/80" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-slate-950/30 via-transparent to-slate-950/50" />
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs tracking-[0.35em] uppercase text-slate-200/60 pointer-events-none">
        GeoTARS - Global Agriculture Insight
      </div>
    </div>
  )
}
