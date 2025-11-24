import type { County } from '@/types/region'

// 计算两点间球面距离（单位：km）
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// 在给定县列表中，查找与传入坐标最近的县（centroid 为 [lat, lon]）
export function findNearestCounty(lat: number, lon: number, counties: County[]): County | null {
  if (!counties || counties.length === 0) return null
  let nearest: County = counties[0]
  let bestDist = Number.POSITIVE_INFINITY
  for (const c of counties) {
    const [clat, clon] = c.centroid
    const d = haversineKm(lat, lon, clat, clon)
    if (d < bestDist) {
      bestDist = d
      nearest = c
    }
  }
  return nearest
}


