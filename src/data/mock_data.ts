import { AnswerResponse, ForecastResponse } from '@/types/api'

type FeatureRecord = {
  hrrr_ref_date?: string
  feature_window?: string
  avg_temp_c?: number
  precip_kg_m2?: number
  vpd_kpa?: number
  relative_humidity_pct?: number
  usda_year?: number
  yield_bu_per_acre?: number
  production_bu?: number
}

type FeatureContext = {
  region_id: string
  region_name: string
  crop: string
  score: number
  records: FeatureRecord[]
}

type MockCountyDataset = {
  answer: AnswerResponse & { feature_context?: FeatureContext[] }
  forecast: ForecastResponse
}

export const MOCK_COUNTY_DATA: Record<string, MockCountyDataset> = {
  '17167': {
    answer: {
      answer: `**Sangamon County Outlook (Corn)**  
Early reproductive corn in Sangamon is tracking ahead of trend yield thanks to stable soil moisture and low pest pressure.`,
      contexts: [
        {
          score: 0.82,
          text: {
            content: 'USDA crop progress notes show VT corn with 71% good-to-excellent ratings in central Illinois.'
          }
        },
        {
          score: 0.77,
          text: {
            content: 'Short-range HRRR runs keep daily ET below 5.5 mm through July 18, limiting water stress.'
          }
        }
      ],
      predictions: [
        {
          region_id: '17167',
          region_name: 'Sangamon County',
          crop: 'Corn',
          baseline_year: 2023,
          predicted_yield_bu_per_acre: 202,
          predicted_production_bu: 53000000,
          confidence: 0.9,
          basis: { source: 'GeoTARS Ensemble', method: 'Multimodal Fusion' }
        },
        {
          region_id: '17167',
          region_name: 'Sangamon County',
          crop: 'Soybean',
          baseline_year: 2023,
          predicted_yield_bu_per_acre: 64,
          predicted_production_bu: 17200000,
          confidence: 0.86,
          basis: { source: 'GeoTARS Ensemble', method: 'Multimodal Fusion' }
        }
      ],
      intent: {
        entities: [
          { text: 'Sangamon County', kind: 'region' },
          { text: 'Corn', kind: 'crop' }
        ]
      },
      feature_context: [
        {
          region_id: '17167',
          region_name: 'Sangamon County',
          crop: 'Corn',
          score: 0.91,
          records: [
            {
              hrrr_ref_date: '2024-07-10',
              avg_temp_c: 29.2,
              precip_kg_m2: 5.5,
              vpd_kpa: 1.21,
              relative_humidity_pct: 63,
              usda_year: 2023,
              yield_bu_per_acre: 198,
              production_bu: 52000000
            },
            {
              hrrr_ref_date: '2024-07-13',
              avg_temp_c: 28.1,
              precip_kg_m2: 6.1,
              vpd_kpa: 1.05,
              relative_humidity_pct: 69,
              usda_year: 2022,
              yield_bu_per_acre: 192,
              production_bu: 50500000
            }
          ]
        }
      ]
    },
    forecast: {
      region: 'Sangamon County',
      crop: 'Corn',
      growth_stage: 'VT-R1',
      forecast_data: [
        { time: '2024-07-15', temp: 31, precip: 5.5, wind: 11, risk_level: 'Medium', risk_detail: 'Heat index watch', source: 'HRRR' },
        { time: '2024-07-16', temp: 29, precip: 5.2, wind: 10, risk_level: 'Low', risk_detail: 'Moisture recharge', source: 'HRRR' },
        { time: '2024-07-17', temp: 30, precip: 5.0, wind: 13, risk_level: 'Medium', risk_detail: 'Breezy pollination window', source: 'HRRR' },
        { time: '2024-07-18', temp: 29, precip: 5.0, wind: 12, risk_level: 'Low', risk_detail: 'Balanced evapotranspiration', source: 'HRRR' },
        { time: '2024-07-19', temp: 28, precip: 5.5, wind: 10, risk_level: 'Low', risk_detail: 'Favorable canopy cooling', source: 'HRRR' }
      ]
    }
  },
  '17113': {
    answer: {
      answer: `**McLean County Outlook (Soybean)**  
Soybean canopies show strong NDVI recovery after early June hail, and flowering nodes continue to stack despite mild VPD spikes.`,
      contexts: [
        {
          score: 0.79,
          text: {
            content: 'Sentinel-2 LAI climbed to 4.6 on July 9, outpacing the 5-year average by 12%.'
          }
        },
        {
          score: 0.74,
          text: {
            content: 'Soybean aphid counts remain below threshold thanks to natural predator activity.'
          }
        }
      ],
      predictions: [
        {
          region_id: '17113',
          region_name: 'McLean County',
          crop: 'Soybean',
          baseline_year: 2023,
          predicted_yield_bu_per_acre: 66,
          predicted_production_bu: 29000000,
          confidence: 0.88,
          basis: { source: 'GeoTARS Ensemble', method: 'Multimodal Fusion' }
        },
        {
          region_id: '17113',
          region_name: 'McLean County',
          crop: 'Corn',
          baseline_year: 2023,
          predicted_yield_bu_per_acre: 205,
          predicted_production_bu: 64000000,
          confidence: 0.83,
          basis: { source: 'GeoTARS Ensemble', method: 'Multimodal Fusion' }
        }
      ],
      intent: {
        entities: [
          { text: 'McLean County', kind: 'region' },
          { text: 'Soybean', kind: 'crop' }
        ]
      },
      feature_context: [
        {
          region_id: '17113',
          region_name: 'McLean County',
          crop: 'Soybean',
          score: 0.87,
          records: [
            {
              hrrr_ref_date: '2024-07-11',
              avg_temp_c: 27.5,
              precip_kg_m2: 5.3,
              vpd_kpa: 0.98,
              relative_humidity_pct: 72,
              usda_year: 2023,
              yield_bu_per_acre: 63,
              production_bu: 27500000
            },
            {
              hrrr_ref_date: '2024-07-14',
              avg_temp_c: 26.1,
              precip_kg_m2: 5.6,
              vpd_kpa: 0.85,
              relative_humidity_pct: 75,
              usda_year: 2022,
              yield_bu_per_acre: 60,
              production_bu: 26000000
            }
          ]
        }
      ]
    },
    forecast: {
      region: 'McLean County',
      crop: 'Soybean',
      growth_stage: 'R1-R2',
      forecast_data: [
        { time: '2024-07-15', temp: 27, precip: 4.1, wind: 9, risk_level: 'Low', risk_detail: 'Moist flowering conditions', source: 'HRRR' },
        { time: '2024-07-16', temp: 28, precip: 4.0, wind: 10, risk_level: 'Medium', risk_detail: 'Brief VPD spike', source: 'HRRR' },
        { time: '2024-07-17', temp: 28, precip: 4.3, wind: 11, risk_level: 'Medium', risk_detail: 'Heat monitor for R2 pods', source: 'HRRR' },
        { time: '2024-07-18', temp: 26, precip: 4.0, wind: 9, risk_level: 'Low', risk_detail: 'Rains recharge soil', source: 'HRRR' },
        { time: '2024-07-19', temp: 26, precip: 3.8, wind: 10, risk_level: 'Low', risk_detail: 'Cloud cover reduces stress', source: 'HRRR' }
      ]
    }
  },
  '17119': {
    answer: {
      answer: `**Madison County Outlook (Soft Red Winter Wheat)**  
Harvest-ready wheat retains strong test weights after a dry finish, while double-crop soybean planting is ahead of schedule.`,
      contexts: [
        {
          score: 0.76,
          text: {
            content: 'County elevators report average protein of 11.9% from early loads, exceeding contracts.'
          }
        },
        {
          score: 0.7,
          text: {
            content: 'USGS river gauges remain moderate, limiting lodging risk near the Mississippi bottoms.'
          }
        }
      ],
      predictions: [
        {
          region_id: '17119',
          region_name: 'Madison County',
          crop: 'Wheat',
          baseline_year: 2023,
          predicted_yield_bu_per_acre: 84,
          predicted_production_bu: 12100000,
          confidence: 0.84,
          basis: { source: 'GeoTARS Ensemble', method: 'Multimodal Fusion' }
        },
        {
          region_id: '17119',
          region_name: 'Madison County',
          crop: 'Soybean',
          baseline_year: 2023,
          predicted_yield_bu_per_acre: 58,
          predicted_production_bu: 14000000,
          confidence: 0.8,
          basis: { source: 'GeoTARS Ensemble', method: 'Multimodal Fusion' }
        }
      ],
      intent: {
        entities: [
          { text: 'Madison County', kind: 'region' },
          { text: 'Wheat', kind: 'crop' }
        ]
      },
      feature_context: [
        {
          region_id: '17119',
          region_name: 'Madison County',
          crop: 'Wheat',
          score: 0.84,
          records: [
            {
              feature_window: '2024-06-25',
              avg_temp_c: 24.8,
              precip_kg_m2: 2.1,
              vpd_kpa: 0.92,
              relative_humidity_pct: 68,
              usda_year: 2023,
              yield_bu_per_acre: 80,
              production_bu: 11800000
            },
            {
              feature_window: '2024-07-05',
              avg_temp_c: 25.6,
              precip_kg_m2: 1.8,
              vpd_kpa: 1.02,
              relative_humidity_pct: 60,
              usda_year: 2022,
              yield_bu_per_acre: 76,
              production_bu: 11000000
            }
          ]
        }
      ]
    },
    forecast: {
      region: 'Madison County',
      crop: 'Wheat',
      growth_stage: 'Harvest / Double-Crop Establishment',
      forecast_data: [
        { time: '2024-07-15', temp: 32, precip: 2.0, wind: 14, risk_level: 'Medium', risk_detail: 'Afternoon heat for hauling', source: 'HRRR' },
        { time: '2024-07-16', temp: 31, precip: 1.9, wind: 13, risk_level: 'Low', risk_detail: 'Dry harvesting window', source: 'HRRR' },
        { time: '2024-07-17', temp: 30, precip: 2.1, wind: 10, risk_level: 'Medium', risk_detail: 'Rain delay possible', source: 'HRRR' },
        { time: '2024-07-18', temp: 30, precip: 2.3, wind: 11, risk_level: 'Low', risk_detail: 'Ideal for double-crop planting', source: 'HRRR' },
        { time: '2024-07-19', temp: 31, precip: 2.2, wind: 10, risk_level: 'Low', risk_detail: 'Dry soils aid field work', source: 'HRRR' }
      ]
    }
  }
}


// ========== 作物分布与价格走势（模拟） ==========
export type CropDistributionItem = {
  crop: string
  area_pct: number
}

export type PricePoint = {
  date: string
  price_usd: number
}

export type CropDisDataset = {
  fips: string
  county: string
  distribution: CropDistributionItem[]
  priceForecast: PricePoint[]
  // 新增：按作物的价格预测（每个作物一条独立时间序列）
  priceByCrop?: Record<string, PricePoint[]>
}

function buildPriceSeries(seed: number, days = 14, base = 12): PricePoint[] {
  const out: PricePoint[] = []
  const now = new Date()
  let value = base + (seed % 5)
  for (let i = 0; i < days; i += 1) {
    const d = new Date(now.getTime() + i * 24 * 3600 * 1000)
    // 轻微均值回归 + 随机扰动
    const drift = (base - value) * 0.15
    const shock = (Math.random() - 0.5) * 0.6
    value = Math.max(6, value + drift + shock)
    out.push({ date: d.toISOString().slice(0, 10), price_usd: Number(value.toFixed(2)) })
  }
  return out
}

export const MOCK_CROPDIS_DATA: Record<string, CropDisDataset> = {
  // Sangamon
  '17167': {
    fips: '17167',
    county: 'Sangamon County',
    distribution: [
      { crop: 'Corn', area_pct: 46 },
      { crop: 'Soybean', area_pct: 40 },
      { crop: 'Wheat', area_pct: 6 },
      { crop: 'Hay', area_pct: 8 },
    ],
    priceForecast: buildPriceSeries(1, 16, 12.5),
    priceByCrop: {
      Corn: buildPriceSeries(101, 16, 5.2),
      Soybean: buildPriceSeries(102, 16, 12.6),
      Wheat: buildPriceSeries(103, 16, 6.4),
      Hay: buildPriceSeries(104, 16, 8.2),
    },
  },
  // McLean
  '17113': {
    fips: '17113',
    county: 'McLean County',
    distribution: [
      { crop: 'Corn', area_pct: 48 },
      { crop: 'Soybean', area_pct: 42 },
      { crop: 'Wheat', area_pct: 5 },
      { crop: 'Others', area_pct: 5 },
    ],
    priceForecast: buildPriceSeries(2, 16, 12.2),
    priceByCrop: {
      Corn: buildPriceSeries(201, 16, 5.0),
      Soybean: buildPriceSeries(202, 16, 12.3),
      Wheat: buildPriceSeries(203, 16, 6.2),
      Others: buildPriceSeries(204, 16, 7.5),
    },
  },
  // Madison
  '17119': {
    fips: '17119',
    county: 'Madison County',
    distribution: [
      { crop: 'Wheat', area_pct: 34 },
      { crop: 'Soybean', area_pct: 36 },
      { crop: 'Corn', area_pct: 25 },
      { crop: 'Others', area_pct: 5 },
    ],
    priceForecast: buildPriceSeries(3, 16, 11.8),
    priceByCrop: {
      Wheat: buildPriceSeries(301, 16, 6.6),
      Soybean: buildPriceSeries(302, 16, 12.0),
      Corn: buildPriceSeries(303, 16, 5.1),
      Others: buildPriceSeries(304, 16, 7.2),
    },
  },
}


