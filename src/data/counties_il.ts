import type { County } from '@/types/region'

// Illinois 部分县列表（与左侧面板 mock 对齐）
// centroid 顺序为 [lat, lon]，bbox 为 [minLon, minLat, maxLon, maxLat]
export const COUNTIES_IL: County[] = [
  {
    fips: '17167',
    name: 'Sangamon',
    state: 'IL',
    stateFips: '17',
    bbox: [-89.99, 39.52, -89.22, 39.98],
    centroid: [39.76, -89.66],
  },
  {
    fips: '17113',
    name: 'McLean',
    state: 'IL',
    stateFips: '17',
    bbox: [-89.22, 40.32, -88.42, 40.88],
    centroid: [40.6, -88.82],
  },
  {
    fips: '17119',
    name: 'Madison',
    state: 'IL',
    stateFips: '17',
    bbox: [-90.5, 38.5, -89.5, 39.0],
    centroid: [38.8, -90.0],
  },
]


