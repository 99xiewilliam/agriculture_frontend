/**
 * GeoTARS API Client
 */

import { AnswerRequest, AnswerResponse, QueryRequest } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002'
const LOCAL_MODEL_BASE_URL = 'https://apec.znbverynb.xin'
const CONTROL_TOKEN_REGEX = /^\[[A-Z0-9_]+\]$/i

type LocalModelOptions = {
  onToken?: (token: string, meta: { isControl: boolean }) => void
}

export class APIClient {
  private baseURL: string

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_BASE_URL
  }

  /**
   * 调用 /answer 端点：完整的检索 + 预测 + 生成
   */
  async answer(request: AnswerRequest): Promise<AnswerResponse> {
    const response = await fetch(`${this.baseURL}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Answer API failed: ${response.status} ${errorText}`)
    }

    return response.json()
  }

  /**
   * 调用 /query 端点：仅检索，不生成
   */
  async query(request: QueryRequest): Promise<any> {
    const response = await fetch(`${this.baseURL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Query API failed: ${response.status}`)
    }

    return response.json()
  }

  /**
   * 上传图片并调用 /answer
   */
  async answerWithImages(query: string, imageFiles: File[], maxContext = 5): Promise<AnswerResponse> {
    // 对于图片上传，需要先上传到服务器或转成 base64
    // 这里简化为先调用基础 answer（实际应扩展后端支持 multipart/form-data）
    const imagePaths: string[] = []
    
    // TODO: 实现图片上传逻辑或 base64 编码
    // 当前版本仅传递查询文本
    return this.answer({ query, images: imagePaths, max_context: maxContext })
  }

  /**
   * 触发索引重建
   */
  async rebuildIndex(reset = false): Promise<any> {
    const response = await fetch(`${this.baseURL}/index`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reset }),
    })

    if (!response.ok) {
      throw new Error(`Index API failed: ${response.status}`)
    }

    return response.json()
  }

  /**
   * 调用本地大模型 /query_stream 接口
   */
  async queryLocalModel(
    payload: { message: string; target_language: string; user_id: string },
    options: LocalModelOptions = {}
  ): Promise<string> {
    let response: Response
    try {
      response = await fetch(`${LOCAL_MODEL_BASE_URL}/query_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      })
    } catch (error) {
      console.error('直接访问模型API失败，可能需要用户接受证书风险:', error)
      throw error
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Local model API failed: ${response.status} ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (reader) {
      const decoder = new TextDecoder()
      let buffer = ''
      let finalText = ''

      const processEvent = (eventChunk: string) => {
        const lines = eventChunk.split(/\r?\n/)
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const dataPayload = trimmed.slice(5).trim()
          if (!dataPayload) continue
          try {
            const parsed = JSON.parse(dataPayload)
            const token: string = typeof parsed.token === 'string' ? parsed.token : ''
            if (!token) continue
            const isControl = CONTROL_TOKEN_REGEX.test(token)
            if (!isControl) {
              finalText += token
            }
            options.onToken?.(token, { isControl })
          } catch (err) {
            console.warn('解析本地模型 SSE 数据失败:', err)
          }
        }
      }

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let separatorIndex: number
        while ((separatorIndex = buffer.indexOf('\n\n')) >= 0) {
          const eventChunk = buffer.slice(0, separatorIndex)
          buffer = buffer.slice(separatorIndex + 2)
          if (eventChunk.trim()) {
            processEvent(eventChunk)
          }
        }
      }
      if (buffer.trim()) {
        processEvent(buffer)
      }
      return finalText.trim()
    }

    return (await response.text()).trim()
  }
}

export const apiClient = new APIClient()

