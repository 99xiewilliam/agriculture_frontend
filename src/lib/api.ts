/**
 * GeoTARS API Client
 */

import { AnswerRequest, AnswerResponse, QueryRequest, QueryResponse } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002'

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
  async query(request: QueryRequest): Promise<QueryResponse> {
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
}

export const apiClient = new APIClient()

