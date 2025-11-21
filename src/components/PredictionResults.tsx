'use client'

/**
 * 预测结果展示组件
 */

import { useState, useEffect } from 'react'
import { TrendingUp, AlertTriangle, Info, Download, FileText } from 'lucide-react'
import { PredictionResult, AnswerResponse } from '@/types/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { EnhancedPredictionCard } from './EnhancedPredictionCard'
import { AgentThoughtPanel } from './AgentThoughtPanel'
import { useAppStore } from '@/store/appStore'
import { translations } from '@/locales/translations'

interface PredictionResultsProps {
  data: AnswerResponse | null
  isLoading: boolean
}

export function PredictionResults({ data, isLoading }: PredictionResultsProps) {
  const { language } = useAppStore()
  const t = translations[language]

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          {/* 旋转地球动画 */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-spin" style={{animationDuration: '3s'}} />
            <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl">🌍</span>
            </div>
          </div>
          
          {/* 加载文本 */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">{t.analyzing}</h3>
            <p className="text-sm text-gray-600">{t.analyzingDesc}</p>
          </div>
          
          {/* 进度指示器 */}
          <div className="space-y-3">
            <LoadingStep label={t.steps.intent} delay={0} />
            <LoadingStep label={t.steps.retrieve} delay={300} />
            <LoadingStep label={t.steps.reason} delay={600} />
            <LoadingStep label={t.steps.generate} delay={900} />
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>{t.emptyState}</p>
        </div>
      </div>
    )
  }

  const predictions = data.predictions || []
  const hasRisks = predictions.some((p) => p.risk_flags && p.risk_flags.length > 0)

  return (
    <div className="space-y-6 p-6">
      {/* Agent 思考可视化 */}
      {data.agent_thought && (
        <AgentThoughtPanel agentThought={data.agent_thought} />
      )}

      {/* 预测摘要卡片 */}
      {predictions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            {t.predictionResults}
          </h2>
          
          {predictions.map((pred, idx) => (
            <EnhancedPredictionCard key={idx} prediction={pred} index={idx} />
          ))}
        </div>
      )}

      {/* LLM 完整报告 */}
      {data.answer && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t.detailedReport}
          </h3>
          {/* 使用 .prose 类，并移除可能冲突的内联样式 */}
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.answer}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* 证据浏览 */}
      {data.contexts && data.contexts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-purple-600" />
            {t.evidence} ({data.contexts.length})
          </h3>
          <div className="space-y-3">
            {data.contexts.slice(0, 5).map((ctx, idx) => (
              <EvidenceCard key={idx} context={ctx} index={idx + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PredictionCard({ prediction }: { prediction: PredictionResult }) {
  const { language } = useAppStore()
  const t = translations[language]

  const confidenceColor =
    prediction.confidence >= 0.7
      ? 'text-green-600 bg-green-50'
      : prediction.confidence >= 0.5
      ? 'text-yellow-600 bg-yellow-50'
      : 'text-red-600 bg-red-50'

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-md p-6 border-2 border-green-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {prediction.region_name || prediction.region_id}
          </h3>
          <p className="text-sm text-gray-600">
            {prediction.crop.toUpperCase()} · {language === 'zh' ? '基准年份' : 'Baseline Year'}: {prediction.baseline_year || 'N/A'}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${confidenceColor}`}>
          {t.confidence}: {(prediction.confidence * 100).toFixed(0)}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-md p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">{t.predictedYield}</p>
          <p className="text-2xl font-bold text-green-700">
            {prediction.predicted_yield_bu_per_acre?.toFixed(1) || 'N/A'}
            <span className="text-sm font-normal text-gray-600 ml-1">bu/acre</span>
          </p>
        </div>
        <div className="bg-white rounded-md p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">{t.predictedProduction}</p>
          <p className="text-2xl font-bold text-blue-700">
            {prediction.predicted_production_bu
              ? (prediction.predicted_production_bu / 1_000_000).toFixed(2)
              : 'N/A'}
            <span className="text-sm font-normal text-gray-600 ml-1">M bu</span>
          </p>
        </div>
      </div>

      {/* 风险标签 */}
      {prediction.risk_flags && prediction.risk_flags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700">{t.riskSignal}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {prediction.risk_flags.map((risk, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full border border-red-300"
              >
                {risk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 调整说明 */}
      {prediction.adjustments && prediction.adjustments.length > 0 && (
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-medium">{t.adjustments}:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {prediction.adjustments.map((adj, i) => (
              <li key={i}>{adj}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 数据来源 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <span className="font-medium">{t.dataSource}:</span> {prediction.basis.source}
        </p>
      </div>
    </div>
  )
}

// 加载步骤组件
function LoadingStep({ label, delay }: { label: string; delay: number }) {
  const [isActive, setIsActive] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isActive ? 'bg-green-500 pulse-glow' : 'bg-gray-300'}`} />
      <span className={`text-sm transition-all duration-500 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  )
}

function EvidenceCard({ context, index }: { context: any; index: number }) {
  const text = context.text
  const image = context.image

  return (
    <div className="group border border-gray-200 rounded-xl p-4 hover:shadow-xl hover:border-purple-300 transition-all duration-300 interactive-hover bg-white">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <span className="text-sm font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent">{index}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {text && (
            <>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-900 px-2 py-0.5 bg-gray-100 rounded">
                  {text.doc_id || text.geo_name || 'Unknown source'}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  📅 {text.doc_date || text.date || 'Unknown date'}
                </span>
                {text.geo_level && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {text.geo_level}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                {text.content}
              </p>
            </>
          )}
          {image && (
            <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700 font-medium">{image.caption}</p>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                  style={{ width: `${Math.min(context.score * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-purple-600">
                {(context.score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
