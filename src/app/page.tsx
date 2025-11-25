'use client'

/**
 * GeoTARS 主页面：三栏布局
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RegionSelector } from '@/components/RegionSelector'
import { EnhancedMultimodalInput } from '@/components/EnhancedMultimodalInput'
import { PredictionResults } from '@/components/PredictionResults'
import { VisualizationPanel, extractTimeSeriesData, TimeSeriesPoint } from '@/components/VisualizationPanel'
import type { WeatherSeriesPoint } from '@/components/ForecastPanel'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAppStore } from '@/store/appStore'
import { translations } from '@/locales/translations'
import { Menu, X, Leaf } from 'lucide-react'
import { AnswerResponse, ForecastResponse } from '@/types/api'
import { US_STATES } from '@/types/region'
import { COUNTIES_IL } from '@/data/counties_il'
import { findNearestCounty } from '@/utils/spatial'
import { MOCK_COUNTY_DATA } from '@/data/mock_data'
import { Chatbox } from '@/components/chatbox'

const queryClient = new QueryClient()
const EarthBackground = dynamic(() => import('@/components/earth'), { ssr: false })

function MainContent() {
  const { queryText, selectedRegion, selectedCrops, uploadedImages, sidebarCollapsed, toggleSidebar, language, setForecastData, setSelectedRegion, setQueryText } =
    useAppStore()
  const [result, setResult] = useState<AnswerResponse | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const seriesTimerRef = useRef<number | null>(null)
  const weatherTimerRef = useRef<number | null>(null)
  const [liveSeries, setLiveSeries] = useState<TimeSeriesPoint[]>([])
  const [liveWeatherSeries, setLiveWeatherSeries] = useState<WeatherSeriesPoint[]>([])
  const seriesBaselineRef = useRef<SeriesBaseline | null>(null)
  const weatherBaselineRef = useRef<WeatherBaseline | null>(null)
  const earthClickLogicRef = useRef<(coords: { lat: number; lng: number }) => void>(() => {})
  const [isChatboxOpen, setIsChatboxOpen] = useState(false)
  const [chatboxPrompt, setChatboxPrompt] = useState<string | null>(null)
  const [chatboxUserId, setChatboxUserId] = useState<string | null>(null)
  const [rsImages, setRsImages] = useState<string[]>([])
  const [rsPreviewIdx, setRsPreviewIdx] = useState<number | null>(null)
  const t = translations[language]
  const isAnalyzing = isChatboxOpen

  const buildFinalPrompt = useCallback(() => {
    const regionName = selectedRegion.name || (language === 'zh' ? '所选区域' : 'selected region')
    const cropNames = selectedCrops.length
      ? selectedCrops.join(language === 'zh' ? '、' : ', ')
      : language === 'zh'
      ? '大豆'
      : 'soybeans'
    const base =
      language === 'zh'
        ? `请综合最新遥感监测、气象和风险信息，分析 ${regionName} 地区 ${cropNames} 的生产情况、潜在风险与管理建议。`
        : `Using the latest remote-sensing, weather and risk signals, analyze ${cropNames} in ${regionName} with actionable recommendations.`
    const followUp = queryText.trim()
    return followUp
      ? `${base}\n${language === 'zh' ? '附加问题' : 'Follow-up'}：${followUp}`
      : base
  }, [language, queryText, selectedCrops, selectedRegion.name])

  const handleChatboxClose = useCallback(() => {
    setIsChatboxOpen(false)
    setChatboxPrompt(null)
    setChatboxUserId(null)
  }, [])
  const stopSeriesTicker = () => {
    if (seriesTimerRef.current) {
      window.clearInterval(seriesTimerRef.current)
      seriesTimerRef.current = null
    }
  }

  const startSeriesTicker = (seedSeries: TimeSeriesPoint[]) => {
    stopSeriesTicker()
    const baseline = computeSeriesBaseline(seedSeries)
    seriesBaselineRef.current = baseline
    const normalizedSeed = normalizeSeriesWindow(seedSeries, baseline)
    setLiveSeries(normalizedSeed)
    if (!normalizedSeed.length) return
    seriesTimerRef.current = window.setInterval(() => {
      setLiveSeries(prev => {
        const source = prev.length ? prev : normalizedSeed
        const nextPoint = generateNextPoint(source[source.length - 1], seriesBaselineRef.current)
        const nextWindow = [...source.slice(1), nextPoint]
        return normalizeSeriesWindow(nextWindow, seriesBaselineRef.current)
      })
    }, 5000)
  }

  const stopWeatherTicker = () => {
    if (weatherTimerRef.current) {
      window.clearInterval(weatherTimerRef.current)
      weatherTimerRef.current = null
    }
  }

  const startWeatherTicker = (seed: ForecastResponse) => {
    stopWeatherTicker()
    const baseSeries = buildWeatherSeries(seed)
    const baseline = computeWeatherBaseline(baseSeries)
    weatherBaselineRef.current = baseline
    const initial = normalizeWeatherWindow(baseSeries, baseline)
    setLiveWeatherSeries(initial)
    if (!initial.length) return
    weatherTimerRef.current = window.setInterval(() => {
      setLiveWeatherSeries(prev => {
        const source = prev.length ? prev : initial
        const next = generateWeatherPoint(source[source.length - 1], weatherBaselineRef.current)
        return normalizeWeatherWindow([...source.slice(1), next], weatherBaselineRef.current)
      })
    }, 5000)
  }

  useEffect(() => {
    return () => {
      stopWeatherTicker()
      stopSeriesTicker()
    }
  }, [])
  const responseData = result
  const hasResults = Boolean(responseData)

  const loadRandomRsImages = useCallback(async (count = 4) => {
    try {
      const res = await fetch(`/api/rs-images?count=${count}`, { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json().catch(() => null)
      if (data?.images && Array.isArray(data.images)) {
        setRsImages(data.images as string[])
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load RS images', e)
      setRsImages([])
    }
  }, [])

  // 当选择县发生变化时，随机加载4张遥感图片
  useEffect(() => {
    if (selectedRegion?.name || selectedRegion?.fips) {
      void loadRandomRsImages(4)
    } else {
      setRsImages([])
    }
  }, [selectedRegion?.name, selectedRegion?.fips, loadRandomRsImages])

  const handleSubmit = useCallback(() => {
    if (!selectedRegion.name) {
      alert(language === 'zh' ? '请先选择一个县或在地球上点击定位' : 'Please select a county first.')
      return
    }
    if (!selectedCrops.length) {
      alert(language === 'zh' ? '请至少选择一种作物' : 'Please select at least one crop.')
      return
    }

    const finalPrompt = buildFinalPrompt()
    const sessionUserId = generateUserId()
    setChatboxPrompt(finalPrompt)
    setChatboxUserId(sessionUserId)
    setIsChatboxOpen(true)
  }, [selectedRegion.name, selectedCrops, language, buildFinalPrompt])

  useEffect(() => {
    earthClickLogicRef.current = ({ lat, lng }: { lat: number; lng: number }) => {
      const county = findNearestCounty(lat, lng, COUNTIES_IL)
      if (county) {
        setSelectedRegion({
          fips: county.fips,
          name: `${county.name} County, ${US_STATES[county.state]?.name || county.state}`,
          state: county.state,
          bbox: county.bbox,
          centroid: county.centroid,
        })
        setQueryText(language === 'zh'
          ? `分析 ${county.name} County 的大豆产量`
          : `Analyze soybean yield in ${county.name} County`)
      }
      const mockEntry = county ? MOCK_COUNTY_DATA[county.fips] : undefined
      if (mockEntry) {
        setResult(mockEntry.answer)
        setForecastData(mockEntry.forecast)
        startWeatherTicker(mockEntry.forecast)
        const seedSeries = extractTimeSeriesData(mockEntry.answer)
        startSeriesTicker(seedSeries)
      } else {
        setResult(null)
        setForecastData(null)
        stopWeatherTicker()
        stopSeriesTicker()
        setLiveSeries([])
        setLiveWeatherSeries([])
      }
      setShowResultModal(false)
    }
  }, [
    language,
    setSelectedRegion,
    setQueryText,
    setResult,
    setForecastData,
    startWeatherTicker,
    startSeriesTicker,
    stopWeatherTicker,
    stopSeriesTicker
  ])

  const handleEarthClick = useCallback((coords: { lat: number; lng: number }) => {
    earthClickLogicRef.current(coords)
  }, [])

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
            <RegionSelector rsImages={rsImages} onPreview={setRsPreviewIdx} />
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
                       <PredictionResults data={responseData} isLoading={isAnalyzing} />
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
            </main>
            
          </div>

          {/* 右侧可视化面板 - 独立显示，不被地球遮挡 */}
          <aside
            className={`hidden xl:block w-96 2xl:w-[28rem] overflow-y-auto border-l border-gray-200 transition-colors duration-500 ${
              hasResults || isAnalyzing
                ? 'bg-gradient-to-bl from-gray-50 to-blue-50/30'
                : 'bg-white/50'
            }`}
            role="complementary"
            aria-label="数据可视化面板"
          >
          <VisualizationPanel data={responseData} liveSeries={liveSeries} liveWeatherSeries={liveWeatherSeries} />
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
              <div className={`h-2 w-2 rounded-full ${isAnalyzing ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <span className="text-gray-600">
                {isAnalyzing ? (language === 'zh' ? '分析中...' : 'Analyzing...') : (language === 'zh' ? '就绪' : 'Ready')}
              </span>
            </div>
            
            <span className="text-gray-400">v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* 快照预览（放大查看） */}
      {rsPreviewIdx !== null && rsImages[rsPreviewIdx] && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-white/40 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-white/40 max-w-5xl w-full max-h-[90%] overflow-hidden">
            <button
              type="button"
              onClick={() => setRsPreviewIdx(null)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Close preview"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50">
              <img
                src={rsImages[rsPreviewIdx]}
                alt="RS-Preview"
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      <Chatbox
        open={isChatboxOpen}
        onClose={handleChatboxClose}
        initialPrompt={chatboxPrompt}
        userId={chatboxUserId}
        language={language}
      />
    </div>
  )
}

function generateUserId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  return `geo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function jitterForecast(seed: ForecastResponse): ForecastResponse {
  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))
  const pickRisk = (temp: number, precip: number, wind: number): ForecastResponse['forecast_data'][number]['risk_level'] => {
    if (temp >= 32 || wind >= 18) return 'High'
    if (precip === 0 && temp >= 30) return 'Medium'
    return precip > 6 ? 'Low' : 'Low'
  }

  return {
    ...seed,
    forecast_data: seed.forecast_data.map(entry => {
      const temp = Number(clamp(entry.temp + (Math.random() - 0.5) * 1.5, 20, 40).toFixed(1))
      const precip = Number(Math.max(0, entry.precip + (Math.random() - 0.5) * 1.5).toFixed(1))
      const wind = Math.max(0, Math.round(entry.wind + (Math.random() - 0.5) * 3))
      const risk_level = pickRisk(temp, precip, wind)
      return {
        ...entry,
        temp,
        precip,
        wind,
        risk_level,
      }
    })
  }
}

function generateNextPoint(lastPoint: TimeSeriesPoint, baselineInput: SeriesBaseline | null): TimeSeriesPoint {
  const baseline = baselineInput ?? defaultSeriesBaseline(lastPoint)
  const lastTimestamp = lastPoint.timestamp ?? Date.now()
  const timestamp = lastTimestamp + 5000

  return {
    timestamp,
    label: formatTimeLabel(new Date(timestamp)),
    temp_c: meanRevertingStep(lastPoint.temp_c, baseline.temp, 0.15),
    precip: Math.max(0, meanRevertingStep(lastPoint.precip, baseline.precip, 0.25)),
    vpd: Math.max(0, meanRevertingStep(lastPoint.vpd, baseline.vpd, 0.04)),
    rh: Math.min(100, Math.max(30, meanRevertingStep(lastPoint.rh, baseline.rh, 0.6))),
  }
}

const SERIES_WINDOW = 30
const WEATHER_WINDOW = 20

function normalizeSeriesWindow(seed: TimeSeriesPoint[], baselineInput: SeriesBaseline | null): TimeSeriesPoint[] {
  if (!seed.length) return []
  const trimmed = seed.slice(-SERIES_WINDOW)
  if (trimmed.length === SERIES_WINDOW) return trimmed

  const missing = SERIES_WINDOW - trimmed.length
  const first = trimmed[0]
  const fillers: TimeSeriesPoint[] = []
  const baseline = baselineInput ?? defaultSeriesBaseline(first)
  let prevTemp = first.temp_c
  let prevPrecip = first.precip
  let prevVpd = first.vpd
  let prevRh = first.rh
  for (let i = missing; i > 0; i--) {
    const timestamp = first.timestamp - i * 5000
    prevTemp = meanRevertingStep(prevTemp, baseline.temp, 0.12)
    prevPrecip = meanRevertingStep(prevPrecip, baseline.precip, 0.2)
    prevVpd = meanRevertingStep(prevVpd, baseline.vpd, 0.03)
    prevRh = meanRevertingStep(prevRh, baseline.rh, 0.5)
    fillers.push({
      timestamp,
      label: formatTimeLabel(new Date(timestamp)),
      temp_c: prevTemp,
      precip: Math.max(0, prevPrecip),
      vpd: Math.max(0, prevVpd),
      rh: Math.min(100, Math.max(30, prevRh)),
      ghost: true,
    })
  }
  return [...fillers, ...trimmed]
}

function buildWeatherSeries(forecast: ForecastResponse): WeatherSeriesPoint[] {
  const now = Date.now()
  return forecast.forecast_data.map((entry, idx) => {
    const timestamp = now - (forecast.forecast_data.length - idx) * 5000
    return {
      timestamp,
      label: formatTimeLabel(new Date(timestamp)),
      temp: entry.temp,
      wind: entry.wind,
      precip: entry.precip,
    }
  })
}

function generateWeatherPoint(last: WeatherSeriesPoint, baselineInput: WeatherBaseline | null): WeatherSeriesPoint {
  const baseline = baselineInput ?? defaultWeatherBaseline(last)
  const timestamp = last.timestamp + 5000
  return {
    timestamp,
    label: formatTimeLabel(new Date(timestamp)),
    temp: meanRevertingStep(last.temp, baseline.temp, 0.12),
    wind: meanRevertingStep(last.wind, baseline.wind, 0.2),
    precip: Math.max(0, meanRevertingStep(last.precip, baseline.precip, 0.25)),
  }
}

function normalizeWeatherWindow(series: WeatherSeriesPoint[], baselineInput: WeatherBaseline | null): WeatherSeriesPoint[] {
  if (!series.length) return []
  const trimmed = series.slice(-WEATHER_WINDOW)
  if (trimmed.length === WEATHER_WINDOW) return trimmed
  const missing = WEATHER_WINDOW - trimmed.length
  const first = trimmed[0]
  const baseline = baselineInput ?? defaultWeatherBaseline(first)
  const fillers: WeatherSeriesPoint[] = []
  let prevTemp = first.temp
  let prevWind = first.wind
  let prevPrecip = first.precip
  for (let i = missing; i > 0; i--) {
    const timestamp = first.timestamp - i * 5000
    prevTemp = meanRevertingStep(prevTemp, baseline.temp, 0.1)
    prevWind = meanRevertingStep(prevWind, baseline.wind, 0.15)
    prevPrecip = meanRevertingStep(prevPrecip, baseline.precip, 0.2)
    fillers.push({
      timestamp,
      label: formatTimeLabel(new Date(timestamp)),
      temp: prevTemp,
      wind: prevWind,
      precip: Math.max(0, prevPrecip),
      ghost: true,
    })
  }
  return [...fillers, ...trimmed]
}

const formatTimeLabel = (date: Date) =>
  date.toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

type MetricStats = { mean: number; min: number; max: number }
type SeriesBaseline = {
  temp: MetricStats
  precip: MetricStats
  vpd: MetricStats
  rh: MetricStats
}
type WeatherBaseline = {
  temp: MetricStats
  wind: MetricStats
  precip: MetricStats
}

function computeSeriesBaseline(series: TimeSeriesPoint[]): SeriesBaseline {
  const fallback = defaultSeriesBaseline(series[0])
  if (!series.length) return fallback
  return {
    temp: computeMetricStatsFromAccessor(series, (pt) => pt.temp_c, fallback.temp),
    precip: computeMetricStatsFromAccessor(series, (pt) => pt.precip, fallback.precip),
    vpd: computeMetricStatsFromAccessor(series, (pt) => pt.vpd, fallback.vpd),
    rh: computeMetricStatsFromAccessor(series, (pt) => pt.rh, fallback.rh),
  }
}

function computeWeatherBaseline(series: WeatherSeriesPoint[]): WeatherBaseline {
  const fallback = defaultWeatherBaseline(series[0])
  if (!series.length) return fallback
  return {
    temp: computeMetricStatsFromAccessor(series, (pt) => pt.temp, fallback.temp),
    wind: computeMetricStatsFromAccessor(series, (pt) => pt.wind, fallback.wind),
    precip: computeMetricStatsFromAccessor(series, (pt) => pt.precip, fallback.precip),
  }
}

function computeMetricStatsFromAccessor<T>(
  points: T[],
  getter: (pt: T) => number | undefined,
  fallback: MetricStats
): MetricStats {
  const values = points
    .map(getter)
    .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))
  if (!values.length) return fallback
  const sum = values.reduce((acc, val) => acc + val, 0)
  const mean = sum / values.length
  const min = Math.min(...values)
  const max = Math.max(...values)
  return { mean, min, max }
}

function meanRevertingStep(value: number | undefined, stats: MetricStats, maxStep: number): number {
  const current = typeof value === 'number' && !Number.isNaN(value) ? value : stats.mean
  const drift = (stats.mean - current) * 0.25
  const random = (Math.random() - 0.5) * maxStep * 2
  const next = current + drift + random
  const buffer = Math.max(0.1, (stats.max - stats.min) * 0.15)
  const clampMin = stats.min - buffer
  const clampMax = stats.max + buffer
  return Number(Math.min(clampMax, Math.max(clampMin, next)).toFixed(2))
}

function defaultSeriesBaseline(seed?: TimeSeriesPoint | null): SeriesBaseline {
  const temp = seed?.temp_c ?? 28
  const precip = seed?.precip ?? 2
  const vpd = seed?.vpd ?? 1
  const rh = seed?.rh ?? 65
  return {
    temp: { mean: temp, min: temp - 3, max: temp + 3 },
    precip: { mean: precip, min: 0, max: Math.max(5, precip + 3) },
    vpd: { mean: vpd, min: Math.max(0, vpd - 0.5), max: vpd + 0.5 },
    rh: { mean: rh, min: 40, max: 95 },
  }
}

function defaultWeatherBaseline(seed?: WeatherSeriesPoint | null): WeatherBaseline {
  const temp = seed?.temp ?? 28
  const wind = seed?.wind ?? 8
  const precip = seed?.precip ?? 2
  return {
    temp: { mean: temp, min: 10, max: 45 },
    wind: { mean: wind, min: 0, max: 20 },
    precip: { mean: precip, min: 0, max: Math.max(5, precip + 5) },
  }
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainContent />
    </QueryClientProvider>
  )
}
