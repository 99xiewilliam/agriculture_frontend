'use client'

/**
 * GeoTARS 主页面：三栏布局
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'
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
import { AnswerResponse, ForecastResponse } from '@/types/api'

const queryClient = new QueryClient()
const EarthBackground = dynamic(() => import('@/components/earth'), { ssr: false })

// Mock Data for Earth Interaction
const MOCK_CHAMPAIGN_DATA = {
  region: {
    fips: '17019',
    name: 'Champaign County',
    state: 'IL',
    bbox: null,
    centroid: null
  },
  answer: {
    answer: `**Region Analysis: Champaign County, IL**

Based on the latest satellite imagery (Sentinel-2) and climate data, the agricultural outlook for Champaign County in 2024 is **Robust**.

**Yield Projections:**
- **Soybean:** Projected at **64.2 bu/acre**, showing a +3.5% increase over the 5-year baseline. Early vegetative stages benefit from optimal soil moisture.
- **Corn:** Forecasted at **201.5 bu/acre**. NDVI analysis indicates vigorous canopy development exceeding regional averages.

**Risk Assessment:**
Current risk levels are **Low-Moderate**. While temperature accumulation is on track, a potential short-term precipitation deficit is forecasted for mid-July.

**Key Insights:**
The integration of multimodal data suggests that timely planting and favorable early-season conditions have established a strong foundation for high yields.`,
    predictions: [
      {
        region_id: '17019',
        region_name: 'Champaign County',
        crop: 'Soybean',
        baseline_year: 2023,
        predicted_yield_bu_per_acre: 64.2,
        predicted_production_bu: 5100000,
        confidence: 0.92,
        basis: { source: 'GeoTARS Ensemble', method: 'Multimodal Fusion' }
      },
      {
        region_id: '17019',
        region_name: 'Champaign County',
        crop: 'Corn',
        baseline_year: 2023,
        predicted_yield_bu_per_acre: 201.5,
        predicted_production_bu: 14200000,
        confidence: 0.89,
        basis: { source: 'GeoTARS Ensemble', method: 'Multimodal Fusion' }
      }
    ],
    intent: {
      entities: [
        { text: 'Champaign County', kind: 'region' },
        { text: 'Soybean', kind: 'crop' }
      ]
    }
  } as AnswerResponse,
  forecast: {
    region: 'Champaign County',
    crop: 'Soybean',
    growth_stage: 'Reproductive (R1-R2)',
    forecast_data: [
      { time: '2024-07-10', temp: 28, precip: 0.0, wind: 12, risk_level: 'Low', risk_detail: 'Optimal conditions', source: 'NOAA' },
      { time: '2024-07-11', temp: 30, precip: 0.0, wind: 14, risk_level: 'Medium', risk_detail: 'Heat stress watch', source: 'NOAA' },
      { time: '2024-07-12', temp: 32, precip: 0.0, wind: 10, risk_level: 'Medium', risk_detail: 'High evaporation rate', source: 'NOAA' },
      { time: '2024-07-13', temp: 29, precip: 8.5, wind: 18, risk_level: 'Low', risk_detail: 'Relief rainfall', source: 'NOAA' },
      { time: '2024-07-14', temp: 27, precip: 2.0, wind: 8, risk_level: 'Low', risk_detail: 'Post-rain recovery', source: 'NOAA' },
    ]
  } as ForecastResponse
}

function MainContent() {
  const { queryText, selectedRegion, selectedCrops, uploadedImages, sidebarCollapsed, toggleSidebar, language, setForecastData, targetYear, setSelectedRegion, setQueryText } =
    useAppStore()
  const { mutate: predict, isPending, data } = useYieldPrediction()
  const { mutate: fetchForecast } = useForecast()
  const [result, setResult] = useState<AnswerResponse | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const t = translations[language]
  const responseData = result ?? data ?? null
  const hasResults = Boolean(responseData)

  const handleSubmit = () => {
    if (!queryText.trim()) {
      alert(language === 'zh' ? '请输入查询问题' : 'Please enter a query')
      return
    }

    const primaryCrop = selectedCrops[0] || null
    const selectionPayload = {
      region_name: selectedRegion.name || undefined,
      region_fips: selectedRegion.fips || undefined,
      region_state: selectedRegion.state || undefined,
      crop: primaryCrop,
      crops: selectedCrops.length ? selectedCrops : undefined,
      target_year: targetYear,
    }

    predict(
      { query: queryText, max_context: 5, selection: selectionPayload },
      {
        onSuccess: (response) => {
          setResult(response)
          setShowResultModal(true)
          
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

  const handleEarthClick = () => {
    // 模拟定位到具体区县 (Champaign County)
    setSelectedRegion(MOCK_CHAMPAIGN_DATA.region)
    
    // 填充查询框（可选）
    setQueryText(language === 'zh' ? '分析 Champaign County 的大豆产量' : 'Analyze soybean yield in Champaign County')

    // 设置结果以供右侧面板使用，但不显示中间的模态框
    setResult({
      ...MOCK_CHAMPAIGN_DATA.answer,
      answer: '' // 清空 answer 以避免混淆，或者保留但通过 Modal 控制显隐
    })
    setForecastData(MOCK_CHAMPAIGN_DATA.forecast)
    setShowResultModal(false)
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

        {/* 中间 + 右侧内容区 */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 中间区域包裹层：包含地球背景和预测结果 */}
          <div className="flex-1 relative flex flex-col overflow-hidden h-full">
            <EarthBackground
              className="absolute inset-0 opacity-100 z-0"
              onGlobeClick={handleEarthClick}
            />
            
            {/* Result Modal Overlay */}
            {(showResultModal && responseData) && (
               <div className="absolute inset-0 z-20 flex items-center justify-center p-8 pointer-events-none">
                  <div className="bg-white/80 backdrop-blur-xl w-full max-w-4xl h-full max-h-[90%] rounded-2xl shadow-2xl border border-white/40 pointer-events-auto relative flex flex-col overflow-hidden">
                     {/* Close Button */}
                     <button 
                       onClick={() => setShowResultModal(false)}
                       className="absolute top-4 right-4 p-2 hover:bg-gray-100/50 rounded-full transition-colors z-30"
                     >
                       <X className="w-6 h-6 text-gray-500" />
                     </button>
                     
                     {/* Content */}
                     <div className="flex-1 overflow-y-auto p-6">
                       <PredictionResults data={responseData} isLoading={isPending} />
                     </div>
                  </div>
               </div>
            )}

            {/* 中间主区：Prompt / Empty State */}
            <main
              className="flex-1 relative z-10 pointer-events-none h-full flex flex-col"
              role="main"
              aria-label="预测结果展示区域"
            >
              {!showResultModal && !hasResults && !isPending && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-200/80">
                   <div className="bg-slate-900/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700/50 flex items-center gap-3">
                      <Leaf className="w-5 h-5 text-green-400" />
                      <span className="tracking-widest text-sm font-light">请在左侧输入问题并提交查询</span>
                   </div>
                </div>
              )}
            </main>
            
            {/* Loading State Overlay - Moved outside main to ensure correct positioning */}
            {isPending && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50 pointer-events-auto">
                  <div className="bg-white/95 px-8 py-5 rounded-xl shadow-2xl flex items-center gap-4 border border-gray-100">
                     <div className="animate-spin h-6 w-6 border-3 border-green-600 border-t-transparent rounded-full" />
                     <div className="flex flex-col">
                        <span className="text-gray-900 font-semibold text-base">正在分析区域数据</span>
                        <span className="text-gray-500 text-xs">调用 Qwen3-VL & MMST-ViT 模型...</span>
                     </div>
                  </div>
               </div>
            )}
          </div>

          {/* 右侧可视化面板 - 独立显示，不被地球遮挡 */}
          <aside
            className={`hidden xl:block w-96 2xl:w-[28rem] overflow-y-auto border-l border-gray-200 transition-colors duration-500 ${
              hasResults || isPending
                ? 'bg-gradient-to-bl from-gray-50 to-blue-50/30'
                : 'bg-white/50'
            }`}
            role="complementary"
            aria-label="数据可视化面板"
          >
            <VisualizationPanel data={responseData} />
          </aside>
        </div>
      </div>

      {/* 底部状态栏 */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 px-6 py-2.5 relative z-20">
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
