/**
 * 全球农业区域数据（扩展版）
 * 支持：美国全部50州 + 东南亚台风区 + 其他重点农业国
 */

export interface County {
  fips: string
  name: string
  state: string
  stateFips: string
  bbox: [number, number, number, number] // [minLon, minLat, maxLon, maxLat]
  centroid: [number, number] // [lat, lon]
}

export interface State {
  abbr: string
  name: string
  fips: string
  counties: County[]
}

export interface GlobalRegion {
  id: string
  name: string
  country: string
  bbox: [number, number, number, number]
  centroid: [number, number]
  type: 'admin1' | 'admin2' | 'custom' // admin1=省/州, admin2=县
}

// 美国全部 50 州（扩展版）
export const US_STATES: Record<string, State> = {
  // 原有的玉米带州
  IL: { abbr: 'IL', name: 'Illinois', fips: '17', counties: [] },
  IA: { abbr: 'IA', name: 'Iowa', fips: '19', counties: [] },
  IN: { abbr: 'IN', name: 'Indiana', fips: '18', counties: [] },
  OH: { abbr: 'OH', name: 'Ohio', fips: '39', counties: [] },
  NE: { abbr: 'NE', name: 'Nebraska', fips: '31', counties: [] },
  KS: { abbr: 'KS', name: 'Kansas', fips: '20', counties: [] },
  MN: { abbr: 'MN', name: 'Minnesota', fips: '27', counties: [] },
  SD: { abbr: 'SD', name: 'South Dakota', fips: '46', counties: [] },
  ND: { abbr: 'ND', name: 'North Dakota', fips: '38', counties: [] },
  MO: { abbr: 'MO', name: 'Missouri', fips: '29', counties: [] },
  WI: { abbr: 'WI', name: 'Wisconsin', fips: '55', counties: [] },
  
  // 南部棉花带/水稻区
  MS: { abbr: 'MS', name: 'Mississippi', fips: '28', counties: [] },
  LA: { abbr: 'LA', name: 'Louisiana', fips: '22', counties: [] },
  AR: { abbr: 'AR', name: 'Arkansas', fips: '05', counties: [] },
  TX: { abbr: 'TX', name: 'Texas', fips: '48', counties: [] },
  OK: { abbr: 'OK', name: 'Oklahoma', fips: '40', counties: [] },
  AL: { abbr: 'AL', name: 'Alabama', fips: '01', counties: [] },
  GA: { abbr: 'GA', name: 'Georgia', fips: '13', counties: [] },
  FL: { abbr: 'FL', name: 'Florida', fips: '12', counties: [] },
  SC: { abbr: 'SC', name: 'South Carolina', fips: '45', counties: [] },
  NC: { abbr: 'NC', name: 'North Carolina', fips: '37', counties: [] },
  TN: { abbr: 'TN', name: 'Tennessee', fips: '47', counties: [] },
  
  // 西部农业州
  CA: { abbr: 'CA', name: 'California', fips: '06', counties: [] },
  WA: { abbr: 'WA', name: 'Washington', fips: '53', counties: [] },
  OR: { abbr: 'OR', name: 'Oregon', fips: '41', counties: [] },
  ID: { abbr: 'ID', name: 'Idaho', fips: '16', counties: [] },
  MT: { abbr: 'MT', name: 'Montana', fips: '30', counties: [] },
  WY: { abbr: 'WY', name: 'Wyoming', fips: '56', counties: [] },
  CO: { abbr: 'CO', name: 'Colorado', fips: '08', counties: [] },
  NM: { abbr: 'NM', name: 'New Mexico', fips: '35', counties: [] },
  AZ: { abbr: 'AZ', name: 'Arizona', fips: '04', counties: [] },
  NV: { abbr: 'NV', name: 'Nevada', fips: '32', counties: [] },
  UT: { abbr: 'UT', name: 'Utah', fips: '49', counties: [] },
  
  // 东北部
  NY: { abbr: 'NY', name: 'New York', fips: '36', counties: [] },
  PA: { abbr: 'PA', name: 'Pennsylvania', fips: '42', counties: [] },
  MI: { abbr: 'MI', name: 'Michigan', fips: '26', counties: [] },
  
  // 其他州（补全到 50）
  KY: { abbr: 'KY', name: 'Kentucky', fips: '21', counties: [] },
  VA: { abbr: 'VA', name: 'Virginia', fips: '51', counties: [] },
  WV: { abbr: 'WV', name: 'West Virginia', fips: '54', counties: [] },
  MD: { abbr: 'MD', name: 'Maryland', fips: '24', counties: [] },
  DE: { abbr: 'DE', name: 'Delaware', fips: '10', counties: [] },
  NJ: { abbr: 'NJ', name: 'New Jersey', fips: '34', counties: [] },
  CT: { abbr: 'CT', name: 'Connecticut', fips: '09', counties: [] },
  RI: { abbr: 'RI', name: 'Rhode Island', fips: '44', counties: [] },
  MA: { abbr: 'MA', name: 'Massachusetts', fips: '25', counties: [] },
  VT: { abbr: 'VT', name: 'Vermont', fips: '50', counties: [] },
  NH: { abbr: 'NH', name: 'New Hampshire', fips: '33', counties: [] },
  ME: { abbr: 'ME', name: 'Maine', fips: '23', counties: [] },
  AK: { abbr: 'AK', name: 'Alaska', fips: '02', counties: [] },
  HI: { abbr: 'HI', name: 'Hawaii', fips: '15', counties: [] },
}

// 全球重点农业区域（支持灾害监测蓝图场景）
export const GLOBAL_REGIONS: GlobalRegion[] = [
  // 东南亚台风影响区
  {
    id: 'CN-NCP',
    name: 'China (North China Plain)',
    country: 'China',
    bbox: [113.0, 32.0, 120.0, 40.0],
    centroid: [36.0, 116.0],
    type: 'admin1'
  },
  {
    id: 'PH-PHI',
    name: 'Philippines (Central Visayas)',
    country: 'Philippines',
    bbox: [122.0, 8.0, 126.0, 14.0],
    centroid: [12.0, 124.0],
    type: 'admin1'
  },
  {
    id: 'VN-MEKONG',
    name: 'Vietnam (Mekong Delta)',
    country: 'Vietnam',
    bbox: [104.5, 8.5, 106.8, 11.0],
    centroid: [10.0, 105.8],
    type: 'custom'
  },
  {
    id: 'TH-CENTRAL',
    name: 'Thailand (Central Plains)',
    country: 'Thailand',
    bbox: [99.5, 13.5, 101.0, 15.5],
    centroid: [14.5, 100.5],
    type: 'admin1'
  },
  
  // 南美粮食主产区
  {
    id: 'BR-RS',
    name: 'Brazil (Rio Grande do Sul)',
    country: 'Brazil',
    bbox: [-57.0, -33.75, -49.5, -27.0],
    centroid: [-30.0, -53.0],
    type: 'admin1'
  },
  {
    id: 'AR-BUENOS',
    name: 'Argentina (Buenos Aires Province)',
    country: 'Argentina',
    bbox: [-63.0, -40.0, -56.0, -33.0],
    centroid: [-36.5, -59.5],
    type: 'admin1'
  },
  
  // 欧洲主产区
  {
    id: 'FR-CENTRE',
    name: 'France (Centre-Val de Loire)',
    country: 'France',
    bbox: [0.5, 46.5, 3.0, 48.5],
    centroid: [47.5, 1.8],
    type: 'admin1'
  },
  {
    id: 'UA-CENTRAL',
    name: 'Ukraine (Central Region)',
    country: 'Ukraine',
    bbox: [28.0, 47.5, 35.0, 51.0],
    centroid: [49.0, 31.5],
    type: 'admin1'
  }
]

// 作物选项（扩展版）
export const CROP_OPTIONS = [
  { value: 'corn', label: '玉米 (Corn)', color: '#FCD34D', icon: '🌽' },
  { value: 'soybean', label: '大豆 (Soybean)', color: '#86EFAC', icon: '🫘' },
  { value: 'winterwheat', label: '冬小麦 (Winter Wheat)', color: '#FCA5A5', icon: '🌾' },
  { value: 'cotton', label: '棉花 (Cotton)', color: '#E0E7FF', icon: '☁️' },
  { value: 'rice', label: '水稻 (Rice)', color: '#BEF264', icon: '🌾' },
  { value: 'wheat', label: '小麦 (Wheat)', color: '#FED7AA', icon: '🌾' },
] as const

export type CropType = typeof CROP_OPTIONS[number]['value']

// 灾害类型（对应蓝图中的 Hazard 分类）
export const DISASTER_TYPES = [
  { value: 'typhoon', label: '台风/飓风', severity: 'critical' },
  { value: 'drought', label: '干旱', severity: 'high' },
  { value: 'flood', label: '洪涝', severity: 'high' },
  { value: 'heatwave', label: '高温热浪', severity: 'medium' },
  { value: 'frost', label: '霜冻', severity: 'medium' },
  { value: 'pest', label: '病虫害', severity: 'low' },
] as const

export type DisasterType = typeof DISASTER_TYPES[number]['value']
