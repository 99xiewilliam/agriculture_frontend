/**
 * API 类型定义（扩展版，支持 Agent 新字段）
 */

// 原有类型保持不变
export interface PredictionResult {
  region_id: string
  region_name: string
  crop: string
  baseline_year: number
  predicted_yield_bu_per_acre: number
  predicted_production_bu: number
  confidence: number
  risk_flags?: string[]
  adjustments?: string[]
  basis: {
    source: string
    method: string
  }
}

// 扩展的 Answer Response（集成 Agent 字段）
export interface AnswerResponse {
  answer: string
  contexts: Array<{
    score: number
    text?: {
      content: string
      doc_id?: string
      doc_date?: string
      geo_name?: string
      geo_level?: string
      state?: string
      county?: string
      year?: number
      doc_type?: string
      data_source?: string
    }
    image?: {
      caption: string
      image_path?: string
    }
  }>
  predictions?: PredictionResult[]
  intent?: {
    entities: Array<{ text: string; kind: string; canonical?: string }>
    time_range?: [string, string?]
    granularity?: string
  }
  
  // Agent 新增字段
  agent_thought?: string
  retrieval_debug?: {
    query: string
    results: any[]
    graph_context?: any
  }
  
  // 工具调用记录（未来可从后端返回）
  tool_calls?: Array<{
    tool_name: string
    args: Record<string, any>
    result: string
    duration_ms: number
  }>
}

export interface QueryRequest {
  query: string
  images?: string[]
  max_context?: number
}

// 新增 Forecast 相关类型
export interface ForecastRequest {
  region: string
  crop: string
}

export interface ForecastEntry {
  time: string
  temp: number
  precip: number
  wind: number
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical'
  risk_detail: string
  source: string
}

export interface ForecastResponse {
  region: string
  crop: string
  growth_stage: string
  forecast_data: ForecastEntry[]
  error?: string
}
