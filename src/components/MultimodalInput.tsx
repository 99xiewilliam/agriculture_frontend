'use client'

/**
 * 多模态输入组件：文本 + 图片 + 新闻链接
 */

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Send } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

export function MultimodalInput({ onSubmit }: { onSubmit?: () => void }) {
  const {
    queryText,
    setQueryText,
    uploadedImages,
    addImages,
    removeImage,
    newsUrls,
    addNewsUrl,
    removeNewsUrl,
  } = useAppStore()

  const [newsInput, setNewsInput] = useState('')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'video/*': ['.mp4', '.mov'],
    },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      addImages(acceptedFiles)
    },
  })

  const handleAddNewsUrl = () => {
    if (newsInput.trim() && (newsInput.startsWith('http://') || newsInput.startsWith('https://'))) {
      addNewsUrl(newsInput.trim())
      setNewsInput('')
    }
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      {/* 文本输入框 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          问题描述
        </label>
        <textarea
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="例如：预测伊利诺伊州 Sangamon 县 2025 年玉米产量"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* 图片/视频上传区 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          上传图片或视频（可选）
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? '释放以上传文件'
              : '拖拽图片/视频到这里，或点击选择'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            支持 PNG, JPG, MP4（最多5个文件）
          </p>
        </div>

        {/* 已上传文件列表 */}
        {uploadedImages.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {uploadedImages.map((file, idx) => (
              <div
                key={idx}
                className="relative flex items-center p-2 bg-gray-50 rounded border border-gray-200"
              >
                <ImageIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate flex-1">
                  {file.name}
                </span>
                <button
                  onClick={() => removeImage(idx)}
                  className="ml-2 p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新闻链接输入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          相关新闻链接（可选）
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={newsInput}
            onChange={(e) => setNewsInput(e.target.value)}
            placeholder="https://example.com/drought-alert"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LinkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* 已添加的新闻链接 */}
        {newsUrls.length > 0 && (
          <div className="mt-2 space-y-1">
            {newsUrls.map((url, idx) => (
              <div
                key={idx}
                className="flex items-center p-2 bg-blue-50 rounded border border-blue-200"
              >
                <LinkIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate flex-1"
                >
                  {url}
                </a>
                <button
                  onClick={() => removeNewsUrl(idx)}
                  className="ml-2 p-1 hover:bg-blue-100 rounded"
                >
                  <X className="h-4 w-4 text-blue-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 提交按钮 */}
      <button
        onClick={onSubmit}
        disabled={!queryText.trim()}
        className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        <Send className="h-5 w-5" />
        分析预测
      </button>
    </div>
  )
}

