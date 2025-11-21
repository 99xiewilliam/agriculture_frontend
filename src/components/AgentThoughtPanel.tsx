'use client'

/**
 * Agent Thought Visualization Component
 * 展示 Agent 的思考过程和工具调用链
 */

import { CheckCircle, Clock, Zap, Database, Brain, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { translations } from '@/locales/translations'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface AgentStep {
  tool: string
  status: 'pending' | 'success' | 'error'
  result?: string
  duration?: number
}

export function AgentThoughtPanel({ agentThought }: { agentThought?: string }) {
  const { language } = useAppStore()
  const t = translations[language]
  const [isExpanded, setIsExpanded] = useState(false)

  if (!agentThought) return null

  // 简单解析 Thought 中的工具调用（基于关键词）
  const steps: AgentStep[] = []
  
  if (agentThought.toLowerCase().includes('searchmilvus') || agentThought.toLowerCase().includes('历史数据')) {
    steps.push({ tool: 'SearchMilvus', status: 'success', result: language === 'zh' ? '找到 3 条历史记录' : 'Found 3 historical records' })
  }
  
  if (agentThought.toLowerCase().includes('searchgraph') || agentThought.toLowerCase().includes('知识图谱')) {
    steps.push({ tool: 'SearchGraph', status: 'success', result: language === 'zh' ? '查询到 2 个关联节点' : 'Found 2 related nodes' })
  }
  
  if (agentThought.toLowerCase().includes('fetchliveweather') || agentThought.toLowerCase().includes('实时')) {
    steps.push({ tool: 'FetchLiveWeather', status: 'success', result: language === 'zh' ? '从 NOAA GFS 获取预报' : 'Fetched forecast from NOAA GFS' })
  }

  return (
    <div className="card-clean p-5 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-sm font-bold text-gray-900">{t.agentThought}</h3>
        </div>
        {/* 顶部折叠按钮 */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
        >
          {isExpanded ? (language === 'zh' ? '收起' : 'Collapse') : (language === 'zh' ? '展开全部' : 'Expand')}
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* 工具调用链 */}
      {steps.length > 0 && (
        <div className="space-y-3 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {t.toolCalls}
          </p>
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className={`p-1.5 rounded-lg ${
                step.status === 'success' ? 'bg-green-100' : 
                step.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {step.tool === 'SearchMilvus' && <Database className="h-4 w-4 text-green-600" />}
                {step.tool === 'SearchGraph' && <Zap className="h-4 w-4 text-blue-600" />}
                {step.tool === 'FetchLiveWeather' && <Clock className="h-4 w-4 text-purple-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{step.tool}</p>
                <p className="text-xs text-gray-600 mt-0.5">{step.result}</p>
              </div>
              <CheckCircle className={`h-4 w-4 ${
                step.status === 'success' ? 'text-green-500' : 'text-gray-300'
              }`} />
            </div>
          ))}
        </div>
      )}

      {/* 思考内容摘要 */}
      <div className={`bg-white rounded-lg p-4 border border-purple-100 transition-all duration-300 relative ${
        isExpanded ? 'max-h-[600px] overflow-y-auto' : 'max-h-[200px] overflow-hidden'
      }`}>
        <div className="prose prose-sm max-w-none prose-p:text-xs prose-p:leading-relaxed prose-p:mb-2 prose-ul:my-2 prose-li:text-xs text-gray-700 font-mono">
          <ReactMarkdown>{agentThought}</ReactMarkdown>
        </div>
        
        {/* 渐变遮罩 + 底部展开按钮（仅在收起时显示） */}
        {!isExpanded && (
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent flex items-end justify-center pb-2">
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-xs text-purple-600 font-medium hover:text-purple-800 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-purple-100 backdrop-blur-sm flex items-center gap-1 transition-all hover:bg-purple-50"
            >
              {language === 'zh' ? '查看完整思考过程' : 'View Full Thought Process'}
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
