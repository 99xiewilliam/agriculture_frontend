/**
 * Global application state management with Zustand
 */

import { create } from 'zustand'
import { CropType } from '@/types/region'
import { Language } from '@/locales/translations'
import { ForecastResponse } from '@/types/api'

interface AppState {
  // 语言设置
  language: Language
  setLanguage: (lang: Language) => void

  // 选中的地区
  selectedRegion: {
    fips: string | null
    name: string | null
    state: string | null
    bbox: [number, number, number, number] | null
    centroid: [number, number] | null
  }
  setSelectedRegion: (region: AppState['selectedRegion']) => void

  // 选中的作物
  selectedCrops: CropType[]
  toggleCrop: (crop: CropType) => void
  setSelectedCrops: (crops: CropType[]) => void

  // 查询文本
  queryText: string
  setQueryText: (text: string) => void

  // 上传的图片
  uploadedImages: File[]
  addImages: (images: File[]) => void
  removeImage: (index: number) => void
  clearImages: () => void

  // 新闻链接
  newsUrls: string[]
  addNewsUrl: (url: string) => void
  removeNewsUrl: (index: number) => void

  // 时间范围
  targetYear: number
  setTargetYear: (year: number) => void

  // UI 状态
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  
  activeTab: 'prediction' | 'evidence' | 'visualization'
  setActiveTab: (tab: AppState['activeTab']) => void

  // 预测数据
  forecastData: ForecastResponse | null
  setForecastData: (data: ForecastResponse | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  // 初始值
  language: 'zh', // 默认中文
  selectedRegion: {
    fips: null,
    name: null,
    state: null,
    bbox: null,
    centroid: null,
  },
  selectedCrops: [],
  queryText: '',
  uploadedImages: [],
  newsUrls: [],
  targetYear: new Date().getFullYear() + 1, // 默认预测下一年
  sidebarCollapsed: false,
  activeTab: 'prediction',
  forecastData: null,

  // Actions
  setLanguage: (lang) => set({ language: lang }),

  setSelectedRegion: (region) => set({ selectedRegion: region }),
  
  toggleCrop: (crop) =>
    set((state) => ({
      selectedCrops: state.selectedCrops.includes(crop)
      ? state.selectedCrops.filter((c) => c !== crop)
      : [...state.selectedCrops, crop],
    })),
  
  setSelectedCrops: (crops) => set({ selectedCrops: crops }),
  
  setQueryText: (text) => set({ queryText: text }),
  
  addImages: (images) =>
    set((state) => ({ uploadedImages: [...state.uploadedImages, ...images] })),
  
  removeImage: (index) =>
    set((state) => ({
      uploadedImages: state.uploadedImages.filter((_, i) => i !== index),
    })),
  
  clearImages: () => set({ uploadedImages: [] }),
  
  addNewsUrl: (url) =>
    set((state) => ({ newsUrls: [...state.newsUrls, url] })),
  
  removeNewsUrl: (index) =>
    set((state) => ({ newsUrls: state.newsUrls.filter((_, i) => i !== index) })),
  
  setTargetYear: (year) => set({ targetYear: year }),
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setActiveTab: (tab) => set({ activeTab: tab }),

  setForecastData: (data) => set({ forecastData: data }),
}))
