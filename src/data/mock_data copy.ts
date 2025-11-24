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
            { hrrr_ref_date: '2024-06-20', avg_temp_c: 28.4, precip_kg_m2: 2.1, vpd_kpa: 1.08, relative_humidity_pct: 64, usda_year: 2023, yield_bu_per_acre: 198, production_bu: 52000000 },
            { hrrr_ref_date: '2024-06-21', avg_temp_c: 28.6, precip_kg_m2: 1.8, vpd_kpa: 1.06, relative_humidity_pct: 65 },
            { hrrr_ref_date: '2024-06-22', avg_temp_c: 28.9, precip_kg_m2: 2.0, vpd_kpa: 1.07, relative_humidity_pct: 64 },
            { hrrr_ref_date: '2024-06-23', avg_temp_c: 29.1, precip_kg_m2: 2.4, vpd_kpa: 1.09, relative_humidity_pct: 63 },
            { hrrr_ref_date: '2024-06-24', avg_temp_c: 29.3, precip_kg_m2: 2.7, vpd_kpa: 1.1, relative_humidity_pct: 63 },
            { hrrr_ref_date: '2024-06-25', avg_temp_c: 29.5, precip_kg_m2: 2.5, vpd_kpa: 1.12, relative_humidity_pct: 62 },
            { hrrr_ref_date: '2024-06-26', avg_temp_c: 29.7, precip_kg_m2: 2.6, vpd_kpa: 1.13, relative_humidity_pct: 62, usda_year: 2022, yield_bu_per_acre: 192, production_bu: 50500000 },
            { hrrr_ref_date: '2024-06-27', avg_temp_c: 29.9, precip_kg_m2: 2.9, vpd_kpa: 1.14, relative_humidity_pct: 61 },
            { hrrr_ref_date: '2024-06-28', avg_temp_c: 30.1, precip_kg_m2: 3.1, vpd_kpa: 1.15, relative_humidity_pct: 61 },
            { hrrr_ref_date: '2024-06-29', avg_temp_c: 30.0, precip_kg_m2: 3.0, vpd_kpa: 1.14, relative_humidity_pct: 61 },
            { hrrr_ref_date: '2024-06-30', avg_temp_c: 29.8, precip_kg_m2: 2.8, vpd_kpa: 1.13, relative_humidity_pct: 62 },
            { hrrr_ref_date: '2024-07-01', avg_temp_c: 29.6, precip_kg_m2: 2.5, vpd_kpa: 1.12, relative_humidity_pct: 63 },
            { hrrr_ref_date: '2024-07-02', avg_temp_c: 29.5, precip_kg_m2: 2.8, vpd_kpa: 1.11, relative_humidity_pct: 63 },
            { hrrr_ref_date: '2024-07-03', avg_temp_c: 29.4, precip_kg_m2: 3.2, vpd_kpa: 1.1, relative_humidity_pct: 64 },
            { hrrr_ref_date: '2024-07-04', avg_temp_c: 29.2, precip_kg_m2: 3.3, vpd_kpa: 1.08, relative_humidity_pct: 65 },
            { hrrr_ref_date: '2024-07-05', avg_temp_c: 29.0, precip_kg_m2: 3.6, vpd_kpa: 1.06, relative_humidity_pct: 66 },
            { hrrr_ref_date: '2024-07-06', avg_temp_c: 28.7, precip_kg_m2: 3.8, vpd_kpa: 1.05, relative_humidity_pct: 67 },
            { hrrr_ref_date: '2024-07-07', avg_temp_c: 28.5, precip_kg_m2: 4.0, vpd_kpa: 1.03, relative_humidity_pct: 68 },
            { hrrr_ref_date: '2024-07-08', avg_temp_c: 28.3, precip_kg_m2: 3.5, vpd_kpa: 1.02, relative_humidity_pct: 68 },
            { hrrr_ref_date: '2024-07-09', avg_temp_c: 28.2, precip_kg_m2: 3.1, vpd_kpa: 1.01, relative_humidity_pct: 69 },
            { hrrr_ref_date: '2024-07-10', avg_temp_c: 28.4, precip_kg_m2: 2.7, vpd_kpa: 1.02, relative_humidity_pct: 68 },
            { hrrr_ref_date: '2024-07-11', avg_temp_c: 28.6, precip_kg_m2: 2.4, vpd_kpa: 1.03, relative_humidity_pct: 67 },
            { hrrr_ref_date: '2024-07-12', avg_temp_c: 28.9, precip_kg_m2: 2.6, vpd_kpa: 1.04, relative_humidity_pct: 66 },
            { hrrr_ref_date: '2024-07-13', avg_temp_c: 29.1, precip_kg_m2: 2.9, vpd_kpa: 1.05, relative_humidity_pct: 65 },
            { hrrr_ref_date: '2024-07-14', avg_temp_c: 29.3, precip_kg_m2: 3.1, vpd_kpa: 1.06, relative_humidity_pct: 64 },
            { hrrr_ref_date: '2024-07-15', avg_temp_c: 29.5, precip_kg_m2: 3.0, vpd_kpa: 1.07, relative_humidity_pct: 64 },
            { hrrr_ref_date: '2024-07-16', avg_temp_c: 29.6, precip_kg_m2: 2.8, vpd_kpa: 1.08, relative_humidity_pct: 63 },
            { hrrr_ref_date: '2024-07-17', avg_temp_c: 29.4, precip_kg_m2: 2.5, vpd_kpa: 1.07, relative_humidity_pct: 63 },
            { hrrr_ref_date: '2024-07-18', avg_temp_c: 29.2, precip_kg_m2: 2.4, vpd_kpa: 1.06, relative_humidity_pct: 64 },
            { hrrr_ref_date: '2024-07-19', avg_temp_c: 29.0, precip_kg_m2: 2.6, vpd_kpa: 1.05, relative_humidity_pct: 65 }
          ]
        }
      ]
    },
    forecast: {
      region: 'Sangamon County',
      crop: 'Corn',
      growth_stage: 'VT-R1',
      forecast_data: [
        { time: '2024-07-15', temp: 31, precip: 0.5, wind: 11, risk_level: 'Medium', risk_detail: 'Heat index watch', source: 'HRRR' },
        { time: '2024-07-16', temp: 29, precip: 5.2, wind: 9, risk_level: 'Low', risk_detail: 'Moisture recharge', source: 'HRRR' },
        { time: '2024-07-17', temp: 30, precip: 0.0, wind: 14, risk_level: 'Medium', risk_detail: 'Breezy pollination window', source: 'HRRR' },
        { time: '2024-07-18', temp: 28, precip: 3.0, wind: 12, risk_level: 'Low', risk_detail: 'Balanced evapotranspiration', source: 'HRRR' },
        { time: '2024-07-19', temp: 27, precip: 1.5, wind: 10, risk_level: 'Low', risk_detail: 'Favorable canopy cooling', source: 'HRRR' }
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
            { hrrr_ref_date: '2024-06-18', avg_temp_c: 26.9, precip_kg_m2: 4.0, vpd_kpa: 0.94, relative_humidity_pct: 72, usda_year: 2023, yield_bu_per_acre: 63, production_bu: 27500000 },
            { hrrr_ref_date: '2024-06-19', avg_temp_c: 27.0, precip_kg_m2: 3.8, vpd_kpa: 0.95, relative_humidity_pct: 72 },
            { hrrr_ref_date: '2024-06-20', avg_temp_c: 27.1, precip_kg_m2: 3.6, vpd_kpa: 0.96, relative_humidity_pct: 73 },
            { hrrr_ref_date: '2024-06-21', avg_temp_c: 27.2, precip_kg_m2: 3.5, vpd_kpa: 0.97, relative_humidity_pct: 73 },
            { hrrr_ref_date: '2024-06-22', avg_temp_c: 27.3, precip_kg_m2: 3.4, vpd_kpa: 0.98, relative_humidity_pct: 72 },
            { hrrr_ref_date: '2024-06-23', avg_temp_c: 27.5, precip_kg_m2: 3.2, vpd_kpa: 0.99, relative_humidity_pct: 71, usda_year: 2022, yield_bu_per_acre: 60, production_bu: 26000000 },
            { hrrr_ref_date: '2024-06-24', avg_temp_c: 27.6, precip_kg_m2: 3.0, vpd_kpa: 1.0, relative_humidity_pct: 71 },
            { hrrr_ref_date: '2024-06-25', avg_temp_c: 27.4, precip_kg_m2: 2.9, vpd_kpa: 0.99, relative_humidity_pct: 72 },
            { hrrr_ref_date: '2024-06-26', avg_temp_c: 27.2, precip_kg_m2: 3.1, vpd_kpa: 0.97, relative_humidity_pct: 73 },
            { hrrr_ref_date: '2024-06-27', avg_temp_c: 27.0, precip_kg_m2: 3.5, vpd_kpa: 0.95, relative_humidity_pct: 74 },
            { hrrr_ref_date: '2024-06-28', avg_temp_c: 26.8, precip_kg_m2: 3.8, vpd_kpa: 0.93, relative_humidity_pct: 75 },
            { hrrr_ref_date: '2024-06-29', avg_temp_c: 26.6, precip_kg_m2: 4.1, vpd_kpa: 0.92, relative_humidity_pct: 76 },
            { hrrr_ref_date: '2024-06-30', avg_temp_c: 26.5, precip_kg_m2: 4.4, vpd_kpa: 0.9, relative_humidity_pct: 77 },
            { hrrr_ref_date: '2024-07-01', avg_temp_c: 26.4, precip_kg_m2: 4.0, vpd_kpa: 0.89, relative_humidity_pct: 78 },
            { hrrr_ref_date: '2024-07-02', avg_temp_c: 26.6, precip_kg_m2: 3.7, vpd_kpa: 0.9, relative_humidity_pct: 77 },
            { hrrr_ref_date: '2024-07-03', avg_temp_c: 26.8, precip_kg_m2: 3.3, vpd_kpa: 0.91, relative_humidity_pct: 76 },
            { hrrr_ref_date: '2024-07-04', avg_temp_c: 27.0, precip_kg_m2: 3.1, vpd_kpa: 0.92, relative_humidity_pct: 75 },
            { hrrr_ref_date: '2024-07-05', avg_temp_c: 27.2, precip_kg_m2: 2.9, vpd_kpa: 0.93, relative_humidity_pct: 74 },
            { hrrr_ref_date: '2024-07-06', avg_temp_c: 27.4, precip_kg_m2: 2.7, vpd_kpa: 0.94, relative_humidity_pct: 73 },
            { hrrr_ref_date: '2024-07-07', avg_temp_c: 27.5, precip_kg_m2: 2.5, vpd_kpa: 0.95, relative_humidity_pct: 72 },
            { hrrr_ref_date: '2024-07-08', avg_temp_c: 27.6, precip_kg_m2: 2.4, vpd_kpa: 0.96, relative_humidity_pct: 72 },
            { hrrr_ref_date: '2024-07-09', avg_temp_c: 27.7, precip_kg_m2: 2.2, vpd_kpa: 0.97, relative_humidity_pct: 71 },
            { hrrr_ref_date: '2024-07-10', avg_temp_c: 27.6, precip_kg_m2: 2.5, vpd_kpa: 0.96, relative_humidity_pct: 72 },
            { hrrr_ref_date: '2024-07-11', avg_temp_c: 27.5, precip_kg_m2: 2.8, vpd_kpa: 0.95, relative_humidity_pct: 73 },
            { hrrr_ref_date: '2024-07-12', avg_temp_c: 27.3, precip_kg_m2: 3.0, vpd_kpa: 0.94, relative_humidity_pct: 74 },
            { hrrr_ref_date: '2024-07-13', avg_temp_c: 27.1, precip_kg_m2: 3.2, vpd_kpa: 0.93, relative_humidity_pct: 75 },
            { hrrr_ref_date: '2024-07-14', avg_temp_c: 26.9, precip_kg_m2: 3.4, vpd_kpa: 0.92, relative_humidity_pct: 76 },
            { hrrr_ref_date: '2024-07-15', avg_temp_c: 26.7, precip_kg_m2: 3.6, vpd_kpa: 0.91, relative_humidity_pct: 77 },
            { hrrr_ref_date: '2024-07-16', avg_temp_c: 26.6, precip_kg_m2: 3.8, vpd_kpa: 0.9, relative_humidity_pct: 78 },
            { hrrr_ref_date: '2024-07-17', avg_temp_c: 26.8, precip_kg_m2: 3.5, vpd_kpa: 0.91, relative_humidity_pct: 77 }
          ]
        }
      ]
    },
    forecast: {
      region: 'McLean County',
      crop: 'Soybean',
      growth_stage: 'R1-R2',
      forecast_data: [
        { time: '2024-07-15', temp: 27, precip: 4.1, wind: 8, risk_level: 'Low', risk_detail: 'Moist flowering conditions', source: 'HRRR' },
        { time: '2024-07-16', temp: 28, precip: 0.0, wind: 10, risk_level: 'Medium', risk_detail: 'Brief VPD spike', source: 'HRRR' },
        { time: '2024-07-17', temp: 29, precip: 0.0, wind: 12, risk_level: 'Medium', risk_detail: 'Heat monitor for R2 pods', source: 'HRRR' },
        { time: '2024-07-18', temp: 26, precip: 6.3, wind: 9, risk_level: 'Low', risk_detail: 'Rains recharge soil', source: 'HRRR' },
        { time: '2024-07-19', temp: 25, precip: 1.0, wind: 7, risk_level: 'Low', risk_detail: 'Cloud cover reduces stress', source: 'HRRR' }
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
            { feature_window: '2024-06-10', avg_temp_c: 25.1, precip_kg_m2: 0.9, vpd_kpa: 0.94, relative_humidity_pct: 66, usda_year: 2023, yield_bu_per_acre: 80, production_bu: 11800000 },
            { feature_window: '2024-06-11', avg_temp_c: 25.0, precip_kg_m2: 1.1, vpd_kpa: 0.93, relative_humidity_pct: 67 },
            { feature_window: '2024-06-12', avg_temp_c: 24.9, precip_kg_m2: 1.3, vpd_kpa: 0.92, relative_humidity_pct: 68 },
            { feature_window: '2024-06-13', avg_temp_c: 24.8, precip_kg_m2: 1.2, vpd_kpa: 0.91, relative_humidity_pct: 68 },
            { feature_window: '2024-06-14', avg_temp_c: 24.6, precip_kg_m2: 1.0, vpd_kpa: 0.9, relative_humidity_pct: 69 },
            { feature_window: '2024-06-15', avg_temp_c: 24.4, precip_kg_m2: 0.8, vpd_kpa: 0.89, relative_humidity_pct: 69 },
            { feature_window: '2024-06-16', avg_temp_c: 24.3, precip_kg_m2: 0.7, vpd_kpa: 0.88, relative_humidity_pct: 70 },
            { feature_window: '2024-06-17', avg_temp_c: 24.2, precip_kg_m2: 0.6, vpd_kpa: 0.87, relative_humidity_pct: 70 },
            { feature_window: '2024-06-18', avg_temp_c: 24.1, precip_kg_m2: 0.5, vpd_kpa: 0.86, relative_humidity_pct: 71 },
            { feature_window: '2024-06-19', avg_temp_c: 24.2, precip_kg_m2: 0.4, vpd_kpa: 0.87, relative_humidity_pct: 71 },
            { feature_window: '2024-06-20', avg_temp_c: 24.4, precip_kg_m2: 0.5, vpd_kpa: 0.88, relative_humidity_pct: 70 },
            { feature_window: '2024-06-21', avg_temp_c: 24.6, precip_kg_m2: 0.6, vpd_kpa: 0.89, relative_humidity_pct: 69 },
            { feature_window: '2024-06-22', avg_temp_c: 24.8, precip_kg_m2: 0.7, vpd_kpa: 0.9, relative_humidity_pct: 68 },
            { feature_window: '2024-06-23', avg_temp_c: 25.0, precip_kg_m2: 0.8, vpd_kpa: 0.91, relative_humidity_pct: 67 },
            { feature_window: '2024-06-24', avg_temp_c: 25.2, precip_kg_m2: 0.9, vpd_kpa: 0.92, relative_humidity_pct: 66 },
            { feature_window: '2024-06-25', avg_temp_c: 25.3, precip_kg_m2: 1.0, vpd_kpa: 0.93, relative_humidity_pct: 65 },
            { feature_window: '2024-06-26', avg_temp_c: 25.4, precip_kg_m2: 1.1, vpd_kpa: 0.94, relative_humidity_pct: 65 },
            { feature_window: '2024-06-27', avg_temp_c: 25.5, precip_kg_m2: 1.3, vpd_kpa: 0.95, relative_humidity_pct: 64 },
            { feature_window: '2024-06-28', avg_temp_c: 25.6, precip_kg_m2: 1.5, vpd_kpa: 0.96, relative_humidity_pct: 63, usda_year: 2022, yield_bu_per_acre: 76, production_bu: 11000000 },
            { feature_window: '2024-06-29', avg_temp_c: 25.7, precip_kg_m2: 1.4, vpd_kpa: 0.97, relative_humidity_pct: 63 },
            { feature_window: '2024-06-30', avg_temp_c: 25.8, precip_kg_m2: 1.2, vpd_kpa: 0.98, relative_humidity_pct: 62 },
            { feature_window: '2024-07-01', avg_temp_c: 25.9, precip_kg_m2: 1.0, vpd_kpa: 0.99, relative_humidity_pct: 62 },
            { feature_window: '2024-07-02', avg_temp_c: 25.8, precip_kg_m2: 0.9, vpd_kpa: 0.98, relative_humidity_pct: 63 },
            { feature_window: '2024-07-03', avg_temp_c: 25.6, precip_kg_m2: 0.8, vpd_kpa: 0.97, relative_humidity_pct: 64 },
            { feature_window: '2024-07-04', avg_temp_c: 25.5, precip_kg_m2: 0.7, vpd_kpa: 0.96, relative_humidity_pct: 64 },
            { feature_window: '2024-07-05', avg_temp_c: 25.4, precip_kg_m2: 0.6, vpd_kpa: 0.95, relative_humidity_pct: 65 },
            { feature_window: '2024-07-06', avg_temp_c: 25.3, precip_kg_m2: 0.5, vpd_kpa: 0.94, relative_humidity_pct: 65 },
            { feature_window: '2024-07-07', avg_temp_c: 25.2, precip_kg_m2: 0.4, vpd_kpa: 0.93, relative_humidity_pct: 66 },
            { feature_window: '2024-07-08', avg_temp_c: 25.1, precip_kg_m2: 0.5, vpd_kpa: 0.92, relative_humidity_pct: 66 },
            { feature_window: '2024-07-09', avg_temp_c: 25.0, precip_kg_m2: 0.6, vpd_kpa: 0.91, relative_humidity_pct: 67 }
          ]
        }
      ]
    },
    forecast: {
      region: 'Madison County',
      crop: 'Wheat',
      growth_stage: 'Harvest / Double-Crop Establishment',
      forecast_data: [
        { time: '2024-07-15', temp: 32, precip: 0.0, wind: 15, risk_level: 'Medium', risk_detail: 'Afternoon heat for hauling', source: 'HRRR' },
        { time: '2024-07-16', temp: 31, precip: 0.0, wind: 13, risk_level: 'Low', risk_detail: 'Dry harvesting window', source: 'HRRR' },
        { time: '2024-07-17', temp: 29, precip: 4.8, wind: 9, risk_level: 'Medium', risk_detail: 'Rain delay possible', source: 'HRRR' },
        { time: '2024-07-18', temp: 30, precip: 0.0, wind: 11, risk_level: 'Low', risk_detail: 'Ideal for double-crop planting', source: 'HRRR' },
        { time: '2024-07-19', temp: 31, precip: 0.0, wind: 10, risk_level: 'Low', risk_detail: 'Dry soils aid field work', source: 'HRRR' }
      ]
    }
  }
}


