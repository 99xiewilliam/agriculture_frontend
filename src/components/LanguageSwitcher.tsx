'use client'

import { useAppStore } from '@/store/appStore'

export function LanguageSwitcher() {
  const { language, setLanguage } = useAppStore()

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setLanguage('zh')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          language === 'zh'
            ? 'bg-white text-green-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        中文
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          language === 'en'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        English
      </button>
    </div>
  )
}

