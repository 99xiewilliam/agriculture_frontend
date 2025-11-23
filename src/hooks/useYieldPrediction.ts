/**
 * React Query hooks for yield prediction
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { AnswerRequest, AnswerResponse } from '@/types/api'

export function useYieldPrediction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: AnswerRequest) => {
      // 使用普通的 answer API
      return apiClient.answer(request)
    },
    onSuccess: (data, variables) => {
      // 缓存结果用于快速回显
      queryClient.setQueryData(['prediction', variables.query], data)
    },
  })
}

export function useRetrievalOnly() {
  return useMutation({
    mutationFn: async (query: string) => {
      return apiClient.query({ query })
    },
  })
}

export function useImageUploadPrediction() {
  return useMutation({
    mutationFn: async ({ query, images }: { query: string; images: File[] }) => {
      return apiClient.answerWithImages(query, images)
    },
  })
}

/**
 * 获取历史预测记录（从本地缓存）
 */
export function usePredictionHistory() {
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: ['prediction-history'],
    queryFn: () => {
      // 从 QueryClient 缓存中提取历史查询
      const cache = queryClient.getQueryCache()
      const queries = cache.findAll({ queryKey: ['prediction'] })
      return queries
        .map(q => q.state.data as AnswerResponse)
        .filter(Boolean)
        .slice(0, 10) // 最近10条
    },
    staleTime: Infinity, // 历史记录不过期
  })
}

