import { useMutation } from '@tanstack/react-query'
import { ForecastRequest, ForecastResponse } from '@/types/api'

const API_BASE = 'http://127.0.0.1:8002'

export function useForecast() {
  return useMutation({
    mutationFn: async (params: ForecastRequest): Promise<ForecastResponse> => {
      const response = await fetch(`${API_BASE}/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error(`Forecast API failed: ${response.statusText}`)
      }

      return response.json()
    },
  })
}

