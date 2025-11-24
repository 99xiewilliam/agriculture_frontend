'use client'

/**
 * 可视化面板：时序图表、气象对比等
 */

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import type { AnswerResponse, FeatureContext, FeatureContextRecord } from '@/types/api'
import { useAppStore } from '@/store/appStore'
import { translations } from '@/locales/translations'
import { ForecastPanel, WeatherSeriesPoint } from './ForecastPanel'

export type TimeSeriesPoint = {
  timestamp: number
  label: string
  temp_c?: number
  precip?: number
  vpd?: number
  rh?: number
  ghost?: boolean
}

interface VisualizationPanelProps {
  data: AnswerResponse | null
  liveSeries?: TimeSeriesPoint[]
  liveWeatherSeries?: WeatherSeriesPoint[]
}

export function VisualizationPanel({ data, liveSeries, liveWeatherSeries }: VisualizationPanelProps) {
  const { language } = useAppStore()
  const t = translations[language]

  const baseTimeSeriesData = useMemo(() => (data ? extractTimeSeriesData(data) : []), [data])
  const historicalYields = useMemo(() => (data ? extractHistoricalYields(data) : []), [data])
  const featureContext = useMemo(() => (data?.feature_context ?? []), [data])
  const chartSeries = liveSeries && liveSeries.length ? liveSeries : baseTimeSeriesData

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>{language === 'zh' ? '暂无可视化数据' : 'No visualization data'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 h-full overflow-y-auto">
      {/* 未来风险预报面板 */}
      <ForecastPanel liveWeatherSeries={liveWeatherSeries} />

      {/* 气象时序图 */}
      {chartSeries.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-md font-bold text-gray-900 mb-4">
            {language === 'zh' ? '气象特征时序' : 'Weather Time Series'}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                angle={-30}
                textAnchor="end"
                height={50}
                ticks={chartSeries.filter((_, idx) => idx % 5 === 0).map(point => point.label)}
                interval={0}
                allowDataOverflow
                type="category"
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                domain={[0, (dataMax: number) => Math.ceil(dataMax + 5)]}
                allowDataOverflow
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                domain={[0, (dataMax: number) => Math.ceil(dataMax + 3)]}
                allowDataOverflow
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temp_c"
                stroke="#ef4444"
                name={language === 'zh' ? "气温(°C)" : "Temp(°C)"}
                strokeWidth={2}
                isAnimationActive={false}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="precip"
                stroke="#3b82f6"
                name={language === 'zh' ? "降水(kg/m²)" : "Precip(kg/m²)"}
                strokeWidth={2}
                isAnimationActive={false}
                dot={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="vpd"
                stroke="#f59e0b"
                name="VPD(kPa)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                isAnimationActive={false}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 历史产量对比 */}
      {historicalYields.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-md font-bold text-gray-900 mb-4">
            {language === 'zh' ? '历史产量对比' : 'Historical Yields'}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={historicalYields}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="yield" fill="#10b981" name={language === 'zh' ? "单产 (bu/acre)" : "Yield (bu/acre)"} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 特征快照表格 */}
      {featureContext.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-md font-bold text-gray-900 mb-4">
            {language === 'zh' ? '特征快照' : 'Feature Snapshot'}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">{language === 'zh' ? '地区' : 'Region'}</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">{language === 'zh' ? '作物' : 'Crop'}</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">{language === 'zh' ? '匹配分' : 'Score'}</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">{language === 'zh' ? '时间窗' : 'Window'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {featureContext.map((feat, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-800">{feat.region_name || feat.region_id}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                        {feat.crop}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-700">
                      {feat.score.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {feat.records?.[0]?.feature_window || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function EvidenceCard({ context, index }: { context: any; index: number }) {
  const text = context.text
  return (
    <div className="border border-gray-200 rounded p-3 text-sm">
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
          {index}
        </span>
        <div className="flex-1">
          {text && (
            <>
              <p className="text-xs text-gray-600 mb-1">
                {text.doc_id} | {text.doc_date}
              </p>
              <p className="text-gray-800">{text.content?.substring(0, 200)}...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// 辅助函数：从 feature_context 提取时序数据
export function extractTimeSeriesData(data: AnswerResponse): TimeSeriesPoint[] {
  const features: FeatureContext[] = data.feature_context || []
  const now = Date.now()
  const records: FeatureContextRecord[] = []
  features.forEach((feat) => {
    if (feat.records && feat.records.length > 0) {
      records.push(...feat.records)
    }
  })

  return records.map((rec, idx) => {
    const timestamp = now - (records.length - idx) * 1000
    return {
      timestamp,
      label: new Date(timestamp).toLocaleTimeString(undefined, { hour12: false }),
      temp_c: rec.avg_temp_c,
      precip: rec.precip_kg_m2,
      vpd: rec.vpd_kpa,
      rh: rec.relative_humidity_pct,
    }
  })
}

// 提取历史产量趋势
function extractHistoricalYields(data: AnswerResponse): any[] {
  const features: FeatureContext[] = data.feature_context || []
  const yields: any[] = []

  features.forEach((feat) => {
    if (feat.records && feat.records.length > 0) {
      feat.records.forEach((rec: FeatureContextRecord) => {
        if (rec.usda_year && rec.yield_bu_per_acre) {
          yields.push({
            year: rec.usda_year,
            yield: rec.yield_bu_per_acre,
            production: rec.production_bu,
          })
        }
      })
    }
  })

  // 去重并排序
  const uniqueYields = Array.from(
    new Map(yields.map((item) => [item.year, item])).values()
  ).sort((a, b) => a.year - b.year)

  return uniqueYields
}

