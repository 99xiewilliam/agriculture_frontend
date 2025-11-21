'use client'

/**
 * 增强版多模态输入组件：智能提示、快捷键、实时验证
 */

import { useState, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Send, Sparkles, Lightbulb, Info } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { translations } from '@/locales/translations'

export function EnhancedMultimodalInput({ onSubmit }: { onSubmit?: () => void }) {
  const {
    queryText,
    setQueryText,
    uploadedImages,
    addImages,
    removeImage,
    newsUrls,
    addNewsUrl,
    removeNewsUrl,
    selectedRegion,
    selectedCrops,
    targetYear,
    language,
  } = useAppStore()

  const t = translations[language]
  const [newsInput, setNewsInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 智能提示模板
  const QUERY_TEMPLATES = language === 'zh' ? [
    '预测{region} {year}年{crop}产量',
    '分析{region}的{crop}种植风险',
    '对比{region}近三年{crop}产量趋势',
    '{region}是否存在{crop}病虫害风险',
  ] : [
    'Predict {crop} yield in {region} for {year}',
    'Analyze {crop} planting risks in {region}',
    'Compare {crop} yield trends in {region} over last 3 years',
    'Are there {crop} pest risks in {region}?',
  ]

  useEffect(() => {
    setCharCount(queryText.length)
  }, [queryText])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.tiff'],
      'video/*': ['.mp4', '.mov', '.avi'],
    },
    maxFiles: 5,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        alert(language === 'zh' 
          ? `部分文件被拒绝：${rejectedFiles.map(f => f.file.name).join(', ')}`
          : `Some files rejected: ${rejectedFiles.map(f => f.file.name).join(', ')}`
        )
      }
      addImages(acceptedFiles)
    },
  })

  const handleAddNewsUrl = () => {
    const trimmed = newsInput.trim()
    if (trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
      addNewsUrl(trimmed)
      setNewsInput('')
    } else {
      alert(language === 'zh' ? '请输入有效的 URL（以 http:// 或 https:// 开头）' : 'Please enter a valid URL (starts with http:// or https://)')
    }
  }

  // 快捷键：Ctrl+Enter 提交
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        onSubmit?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSubmit])

  // 智能模板填充
  const applyTemplate = (template: string) => {
    let filled = template
    if (selectedRegion.name) {
      filled = filled.replace('{region}', selectedRegion.name)
    }
    if (selectedCrops.length > 0) {
      filled = filled.replace('{crop}', t.crops[selectedCrops[0] as keyof typeof t.crops] || selectedCrops[0])
    }
    filled = filled.replace('{year}', targetYear.toString())
    setQueryText(filled)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const isSubmitDisabled = !queryText.trim()

  return (
    <div className="space-y-4">
      <div className="card-clean p-4">
        {/* 智能建议按钮 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {language === 'zh' ? '问题描述' : 'Query Description'}
          </h3>
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-xs text-gray-600 hover:text-green-600 font-medium flex items-center gap-1.5 px-2 py-1 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {language === 'zh' ? '智能建议' : 'Suggestions'}
          </button>
        </div>

      {/* 智能建议面板 */}
      {showSuggestions && (
        <div className="space-y-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
          <p className="text-xs text-gray-600 font-medium mb-2">{language === 'zh' ? '快速模板：' : 'Templates:'}</p>
          {QUERY_TEMPLATES.map((template, idx) => (
            <button
              key={idx}
              onClick={() => applyTemplate(template)}
              className="w-full text-left text-sm px-3 py-2 bg-white hover:bg-blue-50 rounded-md border border-gray-200 hover:border-blue-300 transition-all"
            >
              {template}
            </button>
          ))}
        </div>
      )}

      {/* 文本输入框 */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder={t.inputPlaceholder}
          className="w-full px-3.5 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none transition-all bg-gray-50/50 placeholder:text-gray-400"
          rows={4}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-3">
          <span className={`text-xs font-medium ${charCount > 500 ? 'text-red-500' : 'text-gray-400'}`}>
            {charCount}/500
          </span>
          <kbd className="hidden sm:inline px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200 font-mono">
            Ctrl+Enter
          </kbd>
        </div>
      </div>
      </div>

      {/* 图片/视频上传区 */}
      <div className="card-clean p-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {language === 'zh' ? '上传图片或视频（可选）' : 'Upload Images/Videos (Optional)'}
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-all ${
            isDragActive ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Upload className={`h-6 w-6 transition-colors ${isDragActive ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <p className={`text-sm font-medium mb-1 transition-colors ${isDragActive ? 'text-green-700' : 'text-gray-700'}`}>
            {isDragActive 
              ? (language === 'zh' ? '释放以上传文件' : 'Drop to upload') 
              : (language === 'zh' ? '拖拽图片/视频到这里，或点击选择' : 'Drag & drop or click to select')}
          </p>
          <p className="text-xs text-gray-500">
            {language === 'zh' ? '支持 PNG, JPG, TIFF, MP4（单个最大 50MB，最多5个文件）' : 'Supports PNG, JPG, TIFF, MP4 (Max 50MB, 5 files)'}
          </p>
        </div>

        {/* 已上传文件列表 */}
        {uploadedImages.length > 0 && (
          <div className="mt-3 space-y-2">
            {uploadedImages.map((file, idx) => (
              <div
                key={idx}
                className="relative group flex items-center p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 ml-2.5 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  onClick={() => removeImage(idx)}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新闻链接输入 */}
      <div className="card-clean p-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {language === 'zh' ? '相关新闻链接（可选）' : 'News Links (Optional)'}
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={newsInput}
            onChange={(e) => setNewsInput(e.target.value)}
            placeholder="https://example.com/agricultural-news"
            className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 placeholder:text-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddNewsUrl()
              }
            }}
          />
          <button
            onClick={handleAddNewsUrl}
            disabled={!newsInput.trim()}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LinkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* 已添加的新闻链接 */}
        {newsUrls.length > 0 && (
          <div className="mt-3 space-y-2">
            {newsUrls.map((url, idx) => (
              <div
                key={idx}
                className="group flex items-center p-2.5 bg-blue-50/50 rounded-lg border border-blue-200 hover:border-blue-300 transition-all"
              >
                <LinkIcon className="h-4 w-4 text-blue-500 mr-2.5 flex-shrink-0" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline truncate flex-1"
                >
                  {url}
                </a>
                <button
                  onClick={() => removeNewsUrl(idx)}
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 提交按钮 */}
      <button
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        className="w-full px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 disabled:hover:shadow-sm transition-all flex items-center justify-center gap-2"
      >
        <Send className="h-5 w-5" />
        <span>
          {isSubmitDisabled ? (language === 'zh' ? '请输入问题' : 'Enter a query') : t.submitBtn}
        </span>
      </button>

      {/* 底部提示 */}
      <div className="flex items-start gap-2 p-3 bg-blue-50/40 rounded-lg border border-blue-100">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-600 leading-relaxed">
          {language === 'zh' 
            ? '您可以结合地区选择、作物选择和年份设置来优化预测结果。上传田间照片或添加相关新闻链接可增强分析准确性。'
            : 'Combine region, crop, and year selection for better results. Uploading field photos or adding news links enhances accuracy.'}
        </p>
      </div>
    </div>
  )
}
