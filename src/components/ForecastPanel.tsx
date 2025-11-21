'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useAppStore } from '@/store/appStore'
import { translations } from '@/locales/translations'
import { TrendingUp, Wind, CloudRain, Thermometer, AlertTriangle } from 'lucide-react'
import type { ForecastEntry } from '@/types/api'

export function ForecastPanel() {
  const { language, forecastData } = useAppStore()
  const t = translations[language]

  if (!forecastData || forecastData.error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">
          {forecastData?.error || (language === 'zh' ? '暂无预报数据' : 'No forecast data')}
        </p>
      </div>
    )
  }

  const { region, crop, growth_stage, forecast_data } = forecastData

  // Transform data for Recharts
  const chartData = forecast_data.map((entry: ForecastEntry) => {
    const time = new Date(entry.time)
    return {
      time: `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:00`,
      temp: entry.temp,
      wind: entry.wind,
      precip: entry.precip,
      risk_numeric: entry.risk_level === 'Critical' ? 4 : entry.risk_level === 'High' ? 3 : entry.risk_level === 'Medium' ? 2 : 1,
      risk_label: entry.risk_level,
      source: entry.source,
    }
  })

  // Risk color mapping
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return '#DC2626' // red-600
      case 'High': return '#F59E0B' // amber-500
      case 'Medium': return '#FBBF24' // yellow-400
      default: return '#10B981' // green-500
    }
  }

  // Calculate risk summary
  const riskSummary = forecast_data.reduce((acc: any, entry: ForecastEntry) => {
    acc[entry.risk_level] = (acc[entry.risk_level] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="card-clean p-4 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {language === 'zh' ? '未来风险预报' : 'Future Risk Forecast'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {region} · {crop} · {language === 'zh' ? '生长阶段' : 'Stage'}: {growth_stage}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{language === 'zh' ? '数据来源' : 'Source'}</p>
            <p className="text-sm font-medium text-blue-600">{forecast_data[0]?.source || 'GFS'}</p>
          </div>
        </div>

        {/* Risk Summary Badges */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {Object.entries(riskSummary).map(([level, count]) => (
            <span
              key={level}
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: getRiskColor(level) + '20', color: getRiskColor(level) }}
            >
              {level}: {count as number}h
            </span>
          ))}
        </div>
      </div>

      {/* Risk Timeline Chart */}
      <div className="card-clean p-4">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {language === 'zh' ? '风险等级时序' : 'Risk Level Timeline'}
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
            <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const data = payload[0].payload
                return (
                  <div className="bg-white p-2 shadow-lg rounded border border-gray-200">
                    <p className="text-xs font-medium">{data.time}</p>
                    <p className="text-xs text-gray-600">Risk: {data.risk_label}</p>
                  </div>
                )
              }}
            />
            <Area type="monotone" dataKey="risk_numeric" stroke="#F59E0B" fill="#FEF3C7" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Weather Metrics Chart */}
      <div className="card-clean p-4">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-red-500" />
          {language === 'zh' ? '气象要素变化' : 'Weather Metrics'}
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const data = payload[0].payload
                return (
                  <div className="bg-white p-3 shadow-lg rounded border border-gray-200">
                    <p className="text-xs font-medium mb-1">{data.time}</p>
                    <p className="text-xs text-gray-600">🌡️ {data.temp.toFixed(1)}°C</p>
                    <p className="text-xs text-gray-600">💨 {data.wind.toFixed(1)} m/s</p>
                    <p className="text-xs text-gray-600">🌧️ {data.precip.toFixed(1)} mm</p>
                  </div>
                )
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#EF4444" name={language === 'zh' ? '温度(°C)' : 'Temp (°C)'} strokeWidth={2} dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="wind" stroke="#3B82F6" name={language === 'zh' ? '风速(m/s)' : 'Wind (m/s)'} strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="precip" stroke="#10B981" name={language === 'zh' ? '降水(mm)' : 'Precip (mm)'} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Details Table */}
      <div className="card-clean p-4">
        <h4 className="text-sm font-bold text-gray-700 mb-3">
          {language === 'zh' ? '详细风险说明' : 'Risk Details'}
        </h4>
        <div className="max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-2 py-1 text-left font-medium text-gray-600">{language === 'zh' ? '时间' : 'Time'}</th>
                <th className="px-2 py-1 text-left font-medium text-gray-600">{language === 'zh' ? '风险' : 'Risk'}</th>
                <th className="px-2 py-1 text-left font-medium text-gray-600">{language === 'zh' ? '说明' : 'Detail'}</th>
              </tr>
            </thead>
            <tbody>
              {forecast_data.filter((e: ForecastEntry) => e.risk_level !== 'Low').map((entry: ForecastEntry, i: number) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-2 py-1.5 text-gray-700">
                    {new Date(entry.time).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit' })}
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className="px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: getRiskColor(entry.risk_level) + '20', color: getRiskColor(entry.risk_level) }}
                    >
                      {entry.risk_level}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-gray-600">{entry.risk_detail || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

