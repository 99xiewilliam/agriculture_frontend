'use client'

/**
 * GeoTARS 主页面：三栏布局
 */

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RegionSelector } from '@/components/RegionSelector'
import { EnhancedMultimodalInput } from '@/components/EnhancedMultimodalInput'
import { PredictionResults } from '@/components/PredictionResults'
import { VisualizationPanel } from '@/components/VisualizationPanel'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useYieldPrediction } from '@/hooks/useYieldPrediction'
import { useForecast } from '@/hooks/useForecast'
import { useAppStore } from '@/store/appStore'
import { translations } from '@/locales/translations'
import { Menu, X, Leaf } from 'lucide-react'
import { AnswerResponse } from '@/types/api'

const queryClient = new QueryClient()

function MainContent() {
  const { queryText, selectedRegion, selectedCrops, uploadedImages, sidebarCollapsed, toggleSidebar, language, setForecastData } =
    useAppStore()
  const { mutate: predict, isPending, data } = useYieldPrediction()
  const { mutate: fetchForecast } = useForecast()
  const [result, setResult] = useState<AnswerResponse | null>(null)
  const t = translations[language]

  const handleSubmit = () => {
    if (!queryText.trim()) {
      alert(language === 'zh' ? '请输入查询问题' : 'Please enter a query')
      return
    }

    predict(
      { query: queryText, max_context: 5 },
      {
        onSuccess: (response) => {
          setResult(response)
          
          // Trigger forecast fetch if region and crop are available
          const regionName = selectedRegion.name || response.intent?.entities?.find((e: any) => e.kind === 'region')?.text
          const cropName = selectedCrops[0] || response.intent?.entities?.find((e: any) => e.kind === 'crop')?.text
          
          if (regionName && cropName) {
            fetchForecast(
              { region: regionName, crop: cropName },
              {
                onSuccess: (forecastRes) => {
                  setForecastData(forecastRes)
                },
                onError: (err) => {
                  console.warn('Forecast fetch failed:', err)
                  setForecastData(null)
                }
              }
            )
          }
        },
        onError: (error) => {
          alert(`${language === 'zh' ? '预测失败' : 'Prediction Failed'}: ${error.message}`)
        },
      }
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - 专业版 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              {sidebarCollapsed ? <Menu className="h-5 w-5 text-gray-600" /> : <X className="h-5 w-5 text-gray-600" />}
            </button>
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Leaf className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  {t.appName}
                </h1>
                <p className="text-xs text-gray-500 font-medium">{t.appSubtitle}</p>
              </div>
            </div>
          </div>
          
          {/* 右侧标签 & 语言切换 */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900">Multimodal Agriculture Analysis</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Powered by <span className="text-green-600 font-medium">Qwen3-VL</span> & <span className="text-blue-600 font-medium">MMST-ViT</span>
              </p>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden md:block" />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* 主体三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧边栏 - 响应式优化 */}
        <aside
          className={`
            w-full lg:w-80 xl:w-96
            bg-white border-r border-gray-200 overflow-y-auto
            transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? 'hidden' : 'block'}
            lg:block
            fixed lg:relative
            inset-y-0 left-0 z-40
            lg:z-auto
          `}
          role="complementary"
          aria-label="输入控制面板"
        >
          <div className="p-4 space-y-6">
            <RegionSelector />
            <EnhancedMultimodalInput onSubmit={handleSubmit} />
          </div>
        </aside>

        {/* 移动端遮罩层 */}
        {!sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        {/* 中间主区：预测结果 - 响应式优化 */}
        <main 
          className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white"
          role="main"
          aria-label="预测结果展示区域"
        >
          <PredictionResults data={result || data} isLoading={isPending} />
        </main>

        {/* 右侧可视化面板 - 响应式优化 */}
        <aside 
          className="hidden xl:block w-96 2xl:w-[28rem] bg-gradient-to-bl from-gray-50 to-blue-50/30 border-l border-gray-200 overflow-y-auto"
          role="complementary"
          aria-label="数据可视化面板"
        >
          <VisualizationPanel data={result || data} />
        </aside>
      </div>

      {/* 底部状态栏 */}
      <footer className="bg-white border-t border-gray-200 px-6 py-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {selectedRegion.fips && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{language === 'zh' ? '选中:' : 'Selected:'}</span>
                <span className="text-gray-900 font-medium">{selectedRegion.name}</span>
              </div>
            )}
            {selectedCrops.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{language === 'zh' ? '作物:' : 'Crops:'}</span>
                <span className="text-gray-900 font-medium">
                  {selectedCrops.map(c => t.crops[c as keyof typeof t.crops] || c).join(', ')}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isPending ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <span className="text-gray-600">
                {isPending ? (language === 'zh' ? '分析中...' : 'Analyzing...') : (language === 'zh' ? '就绪' : 'Ready')}
              </span>
            </div>
            
            <span className="text-gray-400">v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainContent />
    </QueryClientProvider>
  )
}
