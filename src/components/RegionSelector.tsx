'use client'

/**
 * 增强版地区选择器：支持全球区域 + 动态县加载
 */

import { useEffect, useState } from 'react'
import { MapPin, ChevronDown, X, Globe } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { US_STATES, GLOBAL_REGIONS, County } from '@/types/region'
import { COUNTIES_IL } from '@/data/counties_il'
import { translations } from '@/locales/translations'
import dynamic from 'next/dynamic'
import CropDis from './CropDis'

const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded animate-pulse" />,
})

interface RegionSelectorProps {
  rsImages?: string[]
  onPreview?: (idx: number) => void
}

export function RegionSelector({ rsImages = [], onPreview }: RegionSelectorProps) {
  const { selectedRegion, setSelectedRegion, selectedCrops, language } = useAppStore()
  const [mode, setMode] = useState<'us' | 'global'>('us') // 模式切换
  const [stateFilter, setStateFilter] = useState('IL')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [counties, setCounties] = useState<County[]>([])
  const [loading, setLoading] = useState(false)
  const [showCropDis, setShowCropDis] = useState(false)
  const [cropDisFips, setCropDisFips] = useState<string | null>(null)
  const [cropDisCounty, setCropDisCounty] = useState<string | null>(null)
  const t = translations[language]

  // 动态加载县数据（从后端或静态文件）
  useEffect(() => {
    if (mode === 'us' && stateFilter) {
      loadCountiesForState(stateFilter)
    }
  }, [stateFilter, mode])

  const loadCountiesForState = async (stateAbbr: string) => {
    setLoading(true)
    try {
      // 从统一的静态数据源加载（当前仅示例 IL）
      const list: County[] =
        stateAbbr === 'IL' ? COUNTIES_IL : []
      setCounties(list)
    } catch (error) {
      console.error('Failed to load counties:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCounties = counties.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.fips.includes(searchTerm)
  )

  const filteredGlobalRegions = GLOBAL_REGIONS.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCountySelect = (county: County) => {
    setSelectedRegion({
      fips: county.fips,
      name: `${county.name} County, ${US_STATES[county.state]?.name || county.state}`,
      state: county.state,
      bbox: county.bbox,
      centroid: county.centroid,
    })
    setShowDropdown(false)
    setSearchTerm('')
    // 点击矩形框/选择县后，弹出作物分布+价格预测
    setCropDisFips(county.fips)
    setCropDisCounty(`${county.name} County`)
    setShowCropDis(true)
  }

  const handleGlobalRegionSelect = (region: typeof GLOBAL_REGIONS[0]) => {
    setSelectedRegion({
      fips: region.id,
      name: `${region.name}, ${region.country}`,
      state: region.country,
      bbox: region.bbox,
      centroid: region.centroid,
    })
    setShowDropdown(false)
    setSearchTerm('')
  }

  return (
    <div className="space-y-4">
      {/* 模式切换 */}
      <div className="card-clean p-3 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('us')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'us'
                ? 'bg-white shadow-sm text-gray-900 border border-gray-200'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            {t.regionModeUS}
          </button>
          <button
            onClick={() => setMode('global')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'global'
                ? 'bg-white shadow-sm text-gray-900 border border-gray-200'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            {t.regionModeGlobal}
          </button>
        </div>
      </div>

      {/* 美国模式 */}
      {mode === 'us' && (
        <>
          {/* 州选择 */}
          <div className="card-clean p-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
              {t.selectState}
            </label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50/50 text-gray-900 transition-all"
            >
              {Object.entries(US_STATES).map(([abbr, state]) => (
                <option key={abbr} value={abbr}>
                  {state.name} ({abbr})
                </option>
              ))}
            </select>
          </div>

          {/* 县搜索 */}
          <div className="card-clean p-4 relative z-20">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
              {t.selectCounty}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder={t.searchPlaceholder}
                className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 transition-all"
              />
              <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />

              {showDropdown && filteredCounties.length > 0 && (
                <div className="absolute top-full z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
                  {filteredCounties.map((county) => (
                    <button
                      key={county.fips}
                      onClick={() => handleCountySelect(county)}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between group border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {county.name} County
                      </span>
                      <span className="text-xs text-gray-500 group-hover:text-green-600 font-mono">
                        {county.fips}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 全球模式 */}
      {mode === 'global' && (
        <div className="card-clean p-4 relative z-20">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t.searchGlobalPlaceholder}
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={t.searchGlobalPlaceholder}
              className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 transition-all"
            />
            <Globe className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />

            {showDropdown && filteredGlobalRegions.length > 0 && (
              <div className="absolute top-full z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-auto">
                {filteredGlobalRegions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => handleGlobalRegionSelect(region)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                          {region.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {region.country} · {region.type === 'admin1' ? (language === 'zh' ? '省级' : 'Province/State') : (language === 'zh' ? '自定义区域' : 'Custom Region')}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {region.id}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 已选地区显示 */}
      {selectedRegion.fips && (
        <div className={`card-clean p-4 border-2 ${
          mode === 'global' ? 'bg-blue-50/50 border-blue-200' : 'bg-green-50/50 border-green-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${mode === 'global' ? 'bg-blue-100' : 'bg-green-100'}`}>
                {mode === 'global' ? (
                  <Globe className={`h-4 w-4 ${mode === 'global' ? 'text-blue-700' : 'text-green-700'}`} />
                ) : (
                  <MapPin className="h-4 w-4 text-green-700" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedRegion.name}
                </p>
                <p className="text-xs text-gray-600 mt-1 font-mono">
                  ID: {selectedRegion.fips}
                </p>
                {selectedRegion.centroid && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedRegion.centroid[0].toFixed(4)}°, {selectedRegion.centroid[1].toFixed(4)}°
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() =>
                setSelectedRegion({
                  fips: null,
                  name: null,
                  state: null,
                  bbox: null,
                  centroid: null,
                })
              }
              className="p-1.5 hover:bg-red-100 rounded-md transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* 交互式地图（可折叠）*/}
      {mode === 'us' && (
        <details open className="card-clean overflow-hidden">
          <summary className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wide transition-colors">
            {t.interactiveMap}
          </summary>
          <div className="h-64 border-t border-gray-100">
            <InteractiveMap
              counties={counties}
              selectedFips={selectedRegion.fips}
              onCountyClick={handleCountySelect}
            />
          </div>
        </details>
      )}

      {/* 遥感快照：显示在交互式地图下面、作物选择上面 */}
      {rsImages && rsImages.length > 0 && (
        <div className="card-clean p-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">
            {language === 'zh' ? '遥感快照' : 'Remote Sensing Snapshots'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {rsImages.slice(0, 4).map((src, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onPreview?.(idx)}
                className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <img
                  src={src}
                  alt={`RS-${idx + 1}`}
                  className="block w-full h-28 object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'global' && (
        <div className="card-clean p-4 bg-blue-50/30">
          <p className="text-xs text-gray-600">
            {t.globalModeTip}
          </p>
        </div>
      )}

      {/* 作物选择（多选，带图标）*/}
      <div className="card-clean p-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {t.selectCrop}
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { value: 'corn', label: t.crops.corn, icon: '🌽', color: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200' },
            { value: 'soybean', label: t.crops.soybean, icon: '🫘', color: 'bg-green-100 border-green-300 hover:bg-green-200' },
            { value: 'winterwheat', label: t.crops.winterwheat, icon: '🌾', color: 'bg-red-100 border-red-300 hover:bg-red-200' },
            { value: 'cotton', label: t.crops.cotton, icon: '☁️', color: 'bg-blue-100 border-blue-300 hover:bg-blue-200' },
            { value: 'rice', label: t.crops.rice, icon: '🍚', color: 'bg-lime-100 border-lime-300 hover:bg-lime-200' },
            { value: 'wheat', label: t.crops.wheat, icon: '🌾', color: 'bg-orange-100 border-orange-300 hover:bg-orange-200' },
          ].map((crop) => {
            const isSelected = selectedCrops.includes(crop.value as any)
            return (
              <button
                key={crop.value}
                onClick={() => useAppStore.getState().toggleCrop(crop.value as any)}
                className={`px-3 py-2.5 border rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? `${crop.color} border-current shadow-sm`
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <span className="text-base">{crop.icon}</span>
                  {crop.label}
                  {isSelected && <span className="text-green-600 text-lg">✓</span>}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 目标年份 */}
      <div className="card-clean p-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
          {t.targetYear}
        </label>
        <input
          type="number"
          value={useAppStore.getState().targetYear}
          onChange={(e) => useAppStore.getState().setTargetYear(parseInt(e.target.value) || 2025)}
          min={2024}
          max={2030}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50/50 text-gray-900 font-medium transition-all"
        />
      </div>
      {/* 作物分布弹窗 */}
      <CropDis
        open={showCropDis}
        fips={cropDisFips}
        countyName={cropDisCounty || selectedRegion.name || undefined}
        onClose={() => setShowCropDis(false)}
      />
    </div>
  )
}
