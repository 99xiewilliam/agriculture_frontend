'use client'

/**
 * 增强版预测卡片：动画、渐变、数据可视化
 */

import { TrendingUp, AlertTriangle, Award, Calendar, MapPin } from 'lucide-react'
import { PredictionResult } from '@/types/api'
import { useEffect, useState } from 'react'

interface EnhancedPredictionCardProps {
  prediction: PredictionResult
  index?: number
}

export function EnhancedPredictionCard({ prediction, index = 0 }: EnhancedPredictionCardProps) {
  const [yieldValue, setYieldValue] = useState(0)
  const [productionValue, setProductionValue] = useState(0)

  // 数字滚动动画
  useEffect(() => {
    const targetYield = prediction.predicted_yield_bu_per_acre || 0
    const targetProduction = prediction.predicted_production_bu || 0
    const duration = 1000 // 1秒
    const steps = 30
    const yieldStep = targetYield / steps
    const productionStep = targetProduction / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      setYieldValue(Math.min(yieldStep * currentStep, targetYield))
      setProductionValue(Math.min(productionStep * currentStep, targetProduction))
      
      if (currentStep >= steps) {
        clearInterval(interval)
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [prediction])

  const confidenceLevel =
    prediction.confidence >= 0.8
      ? { label: '高', color: 'from-green-500 to-emerald-600', textColor: 'text-green-700', bgColor: 'bg-green-50' }
      : prediction.confidence >= 0.6
      ? { label: '中', color: 'from-yellow-500 to-amber-600', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' }
      : { label: '低', color: 'from-red-500 to-rose-600', textColor: 'text-red-700', bgColor: 'bg-red-50' }

  const hasRisks = prediction.risk_flags && prediction.risk_flags.length > 0

  return (
    <div
      className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100 card-hover"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* 背景装饰渐变 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100/40 via-blue-100/40 to-purple-100/40 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-100/40 via-green-100/40 to-blue-100/40 blur-3xl -z-10" />

      <div className="relative p-6 space-y-5">
        {/* 头部：地区信息 + 置信度 */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">
                {prediction.region_name || prediction.region_id}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200">
                <span className="text-2xl">{getCropEmoji(prediction.crop)}</span>
                <span className="font-medium text-green-800">{getCropLabel(prediction.crop)}</span>
              </span>
              {prediction.baseline_year && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  基准 {prediction.baseline_year}
                </span>
              )}
            </div>
          </div>

          {/* 置信度徽章 */}
          <div className="flex flex-col items-end gap-2">
            <div className={`px-4 py-2 rounded-full ${confidenceLevel.bgColor} border-2 border-current/20`}>
              <div className="flex items-center gap-2">
                <Award className={`h-4 w-4 ${confidenceLevel.textColor}`} />
                <span className={`text-sm font-bold ${confidenceLevel.textColor}`}>
                  置信度 {confidenceLevel.label}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex-1 h-1.5 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${confidenceLevel.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${prediction.confidence * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${confidenceLevel.textColor}`}>
                  {(prediction.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 核心预测数据：大卡片展示 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 单产卡片 */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-green-100 group hover:border-green-300 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-2xl" />
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">预测单产</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black bg-gradient-to-br from-green-700 to-emerald-600 bg-clip-text text-transparent count-animation">
                {yieldValue.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-gray-600">bu/acre</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-700">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>单位面积产量</span>
            </div>
          </div>

          {/* 总产卡片 */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 rounded-xl p-5 border-2 border-blue-100 group hover:border-blue-300 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-2xl" />
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">预测总产</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black bg-gradient-to-br from-blue-700 to-indigo-600 bg-clip-text text-transparent count-animation">
                {productionValue ? (productionValue / 1_000_000).toFixed(2) : '0.00'}
              </span>
              <span className="text-sm font-medium text-gray-600">M bu</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-700">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>总体产量</span>
            </div>
          </div>
        </div>

        {/* 风险标签区域（若有）*/}
        {hasRisks && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-bold text-red-900">风险信号</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {prediction.risk_flags.map((risk, i) => (
                <span
                  key={i}
                  className="badge bg-white text-red-700 border-2 border-red-300 shadow-sm"
                >
                  <span className="text-base">⚠️</span>
                  {risk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 调整说明（可折叠）*/}
        {prediction.adjustments && prediction.adjustments.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors flex items-center gap-2">
              <span>📊 调整依据 ({prediction.adjustments.length})</span>
              <span className="text-xs text-gray-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <ul className="mt-3 space-y-2 pl-6">
              {prediction.adjustments.map((adj, i) => (
                <li key={i} className="text-sm text-gray-600 leading-relaxed flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{adj}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* 数据来源标签 */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">数据源:</span>{' '}
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-mono">
              {prediction.basis.source}
            </span>
          </div>
          {prediction.basis.feature_window && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">时间窗:</span> {prediction.basis.feature_window}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 辅助函数：作物表情符号
function getCropEmoji(crop: string): string {
  const emojiMap: Record<string, string> = {
    corn: '🌽',
    soybean: '🫘',
    winterwheat: '🌾',
    wheat: '🌾',
    cotton: '🌼',
    rice: '🌾',
  }
  return emojiMap[crop.toLowerCase()] || '🌱'
}

// 辅助函数：作物中文标签
function getCropLabel(crop: string): string {
  const labelMap: Record<string, string> = {
    corn: '玉米',
    soybean: '大豆',
    winterwheat: '冬小麦',
    wheat: '小麦',
    cotton: '棉花',
    rice: '水稻',
  }
  return labelMap[crop.toLowerCase()] || crop.toUpperCase()
}

