'use client'

/**
 * 基于 Leaflet 的交互式县级地图
 */

import { useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { County } from '@/types/region'

interface InteractiveMapProps {
  counties: County[]
  selectedFips: string | null
  onCountyClick: (county: County) => void
}

// 根据选中的县自动调整视图
function MapController({ selectedFips, counties }: { selectedFips: string | null; counties: County[] }) {
  const map = useMap()

  useEffect(() => {
    if (selectedFips) {
      const county = counties.find((c) => c.fips === selectedFips)
      if (county && county.centroid) {
        map.setView([county.centroid[0], county.centroid[1]], 10, {
          animate: true,
        })
      }
    }
  }, [selectedFips, counties, map])

  return null
}

export default function InteractiveMap({ counties, selectedFips, onCountyClick }: InteractiveMapProps) {
  // 将县数据转换为 GeoJSON
  const geojson = {
    type: 'FeatureCollection' as const,
    features: counties.map((county) => ({
      type: 'Feature' as const,
      properties: {
        fips: county.fips,
        name: county.name,
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: county.bbox
          ? [
              [
                [county.bbox[0], county.bbox[1]],
                [county.bbox[2], county.bbox[1]],
                [county.bbox[2], county.bbox[3]],
                [county.bbox[0], county.bbox[3]],
                [county.bbox[0], county.bbox[1]],
              ],
            ]
          : [],
      },
    })),
  }

  // 默认中心（伊利诺伊州）
  const defaultCenter: [number, number] = [40.0, -89.0]

  return (
    <MapContainer
      center={defaultCenter}
      zoom={7}
      style={{ height: '400px', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      <GeoJSON
        data={geojson as any}
        style={(feature) => ({
          fillColor: feature?.properties.fips === selectedFips ? '#10b981' : '#93c5fd',
          fillOpacity: feature?.properties.fips === selectedFips ? 0.6 : 0.3,
          color: feature?.properties.fips === selectedFips ? '#059669' : '#3b82f6',
          weight: feature?.properties.fips === selectedFips ? 3 : 1,
        })}
        onEachFeature={(feature, layer) => {
          const fips = feature.properties.fips
          const county = counties.find((c) => c.fips === fips)
          
          if (county) {
            layer.on({
              click: () => onCountyClick(county),
              mouseover: (e) => {
                const layer = e.target
                layer.setStyle({
                  fillOpacity: 0.5,
                  weight: 2,
                })
                layer.bindTooltip(`${county.name} County<br/>FIPS: ${county.fips}`, {
                  permanent: false,
                  direction: 'top',
                }).openTooltip()
              },
              mouseout: (e) => {
                const layer = e.target
                layer.setStyle({
                  fillOpacity: fips === selectedFips ? 0.6 : 0.3,
                  weight: fips === selectedFips ? 3 : 1,
                })
                layer.closeTooltip()
              },
            })
          }
        }}
      />
      
      <MapController selectedFips={selectedFips} counties={counties} />
    </MapContainer>
  )
}

