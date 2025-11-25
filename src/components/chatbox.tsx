/* eslint-disable no-console */
'use client'

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, Send, MessageCircle } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { translations, type Language } from '@/locales/translations'

type ChatRole = 'user' | 'assistant'
type ActionPhase = 'GUARD_CHECK' | 'QUERY_REWRITE' | 'RETRIEVAL' | 'GENERATION'
const ACTION_ORDER: ActionPhase[] = ['GUARD_CHECK', 'QUERY_REWRITE', 'RETRIEVAL', 'GENERATION']

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  rawMarkdown?: string
}

interface ChatboxProps {
  open: boolean
  onClose: () => void
  initialPrompt: string | null
  userId: string | null
  language: Language
}

export function Chatbox({ open, onClose, initialPrompt, userId, language }: ChatboxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [phasePointer, setPhasePointer] = useState<number>(-1)
  const [hasEnteredGeneration, setHasEnteredGeneration] = useState(false)
  const [isAwaitingContent, setIsAwaitingContent] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null)
  const [activeAssistantId, setActiveAssistantId] = useState<string | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 })
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const chatHistoryRef = useRef<ChatMessage[]>([])
  const sessionKeyRef = useRef<string | null>(null)
  // 本地 zIndex：用于与其他弹窗（如 CropDis）互相叠放时，点击置顶
  const [zIndex, setZIndex] = useState<number>(50)
  const chatText = translations[language].chatbox
  const phaseLabels: Record<ActionPhase, string> = {
    GUARD_CHECK: chatText.stages.guardCheck,
    QUERY_REWRITE: chatText.stages.queryRewrite,
    RETRIEVAL: chatText.stages.retrieval,
    GENERATION: chatText.stages.generation,
  }

  useEffect(() => {
    chatHistoryRef.current = messages
  }, [messages])

  useEffect(() => {
    if (!open) {
      return
    }
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const buildPrompt = useCallback((latestUserMessage: string) => {
    return latestUserMessage
  }, [])

  // 计算初始位置（打开时居中）
  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const rect = boxRef.current?.getBoundingClientRect()
      const width = rect?.width ?? Math.min(880, vw - 24)
      const height = rect?.height ?? Math.min(Math.floor(vh * 0.85), vh - 24)
      const x = Math.max(12, Math.round((vw - width) / 2))
      const y = Math.max(12, Math.round((vh - height) / 2))
      setPosition({ x, y })
      // 打开时至少在较高层级
      setZIndex((prev) => (prev < 60 ? 60 : prev))
    })
  }, [open])

  // 拖拽逻辑
  useEffect(() => {
    if (!dragging) return
    const onMove = (e: PointerEvent) => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const w = boxRef.current?.offsetWidth ?? 300
      const h = boxRef.current?.offsetHeight ?? 300
      const margin = 12
      let nextX = e.clientX - dragOffsetRef.current.dx
      let nextY = e.clientY - dragOffsetRef.current.dy
      nextX = Math.min(vw - w - margin, Math.max(margin, nextX))
      nextY = Math.min(vh - h - margin, Math.max(margin, nextY))
      setPosition({ x: nextX, y: nextY })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging])

  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setDragging(true)
      // 点击标题栏时置顶本弹窗
      setZIndex((prev) => (prev < 60 ? 60 : prev + 1))
      dragOffsetRef.current = { dx: e.clientX - position.x, dy: e.clientY - position.y }
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
    },
    [position.x, position.y]
  )

  const handleSpecialToken = useCallback((rawToken: string) => {
    if (!rawToken) return
    if (rawToken.startsWith('ELAPSED_')) {
      const seconds = Number(rawToken.replace('ELAPSED_', '').replace(/s/gi, ''))
      if (!Number.isNaN(seconds)) {
        setElapsedSeconds(seconds)
      }
      return
    }
    const phaseIndex = ACTION_ORDER.indexOf(rawToken as ActionPhase)
    if (phaseIndex >= 0) {
      setPhasePointer((prev) => (phaseIndex > prev ? phaseIndex : prev))
      if (rawToken === 'GENERATION') {
        setHasEnteredGeneration(true)
      }
    }
  }, [])

  const streamAssistantReply = useCallback(
    async (userMessage: string, { skipEcho = false }: { skipEcho?: boolean } = {}) => {
      if (!userId) return
      const assistantId = createMessageId()
      const userChatId = !skipEcho ? createMessageId() : null
      setMessages((prev) => {
        const nextMessages = skipEcho
          ? prev
          : [...prev, { id: userChatId as string, role: 'user' as ChatRole, content: userMessage }]
        return [...nextMessages, { id: assistantId, role: 'assistant' as ChatRole, content: '' }]
      })
      setActiveAssistantId(assistantId)
      if (!skipEcho || hasEnteredGeneration) {
        setPhasePointer(-1)
        setHasEnteredGeneration(false)
        setIsAwaitingContent(true)
        setElapsedSeconds(null)
      }
      setIsStreaming(true)

      let accumulator = ''
      try {
        await apiClient.queryLocalModel(
          {
            message: buildPrompt(userMessage),
            target_language: language,
            user_id: userId,
          },
          {
            onToken: (token, { isControl }) => {
              if (!token) return
              const trimmedToken = token.trim()
              if (isControl) {
                const phaseToken = trimmedToken.replace(/^\[|\]$/g, '')
                // 处理流式阶段标记与完成标记
                if (phaseToken === 'DONE') {
                  setPhasePointer(ACTION_ORDER.length) // 全部完成
                  setHasEnteredGeneration(true)
                  setIsAwaitingContent(false)
                  setActiveAssistantId(null)
                  setIsStreaming(false)
                  try {
                    // 打印最终 Markdown，便于诊断渲染问题
                    // eslint-disable-next-line no-console
                    console.log('[Chatbox][Final Markdown]', accumulator)
                  } catch {}
                  return
                }
                handleSpecialToken(phaseToken)
                if (phaseToken === 'GENERATION') {
                  setIsAwaitingContent(true)
                }
                return
              }
              accumulator += token
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId ? { ...msg, content: accumulator, rawMarkdown: accumulator } : msg
                )
              )
              setIsAwaitingContent(false)
            },
          }
        )
      } catch (error) {
        console.error('Chatbox stream failed', error)
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantId ? { ...msg, content: chatText.errorFallback } : msg))
        )
      } finally {
        if (!accumulator) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: chatText.errorFallback, rawMarkdown: chatText.errorFallback } : msg
            )
          )
        }
        // 无论服务端是否显式发送 [DONE]，流结束即视为完成
        setPhasePointer(ACTION_ORDER.length)
        setIsAwaitingContent(false)
        setActiveAssistantId(null)
        setIsStreaming(false)
        try {
          // 兜底打印最终 Markdown
          // eslint-disable-next-line no-console
          console.log('[Chatbox][Final Markdown]', accumulator)
        } catch {}
      }
    },
    [buildPrompt, chatText.errorFallback, handleSpecialToken, language, userId]
  )

  useEffect(() => {
    if (!open || !initialPrompt || !userId) return
    const key = `${userId}:${initialPrompt}`
    if (sessionKeyRef.current === key) return
    sessionKeyRef.current = key

    const seedMessage: ChatMessage = { id: createMessageId(), role: 'user', content: initialPrompt }
    setMessages([seedMessage])
    setInputValue('')
    setPhasePointer(-1)
    setHasEnteredGeneration(false)
    setElapsedSeconds(null)
    void streamAssistantReply(initialPrompt, { skipEcho: true })
  }, [initialPrompt, open, streamAssistantReply, userId])

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = inputValue.trim()
      if (!trimmed || isStreaming || !userId) return
      setInputValue('')
      void streamAssistantReply(trimmed)
    },
    [inputValue, isStreaming, streamAssistantReply, userId]
  )

  const handleClose = useCallback(() => {
    setMessages([])
    setInputValue('')
    setPhasePointer(-1)
    setHasEnteredGeneration(false)
    setElapsedSeconds(null)
    sessionKeyRef.current = null
    onClose()
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex }}>
      <div
        ref={boxRef}
        className="w-full max-w-3xl pointer-events-auto bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/60 flex flex-col h-[85vh] fixed"
        style={{ left: position.x, top: position.y }}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-white/40 bg-white/60 rounded-t-[32px] ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onPointerDown={onHeaderPointerDown}
        >
          <div>
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span>{chatText.title}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{chatText.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            onPointerDown={(e) => { e.stopPropagation() }}
            onMouseDown={(e) => { e.stopPropagation() }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Close chatbox"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-white/30 bg-gradient-to-r from-emerald-50/60 to-blue-50/40">
          <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wide font-semibold">
            <span>{chatText.timelineTitle}</span>
            <span>
              {phasePointer >= ACTION_ORDER.length - 1 && !isAwaitingContent
                ? chatText.doneStage
                : isAwaitingContent
                ? chatText.assistantTyping
                : elapsedSeconds !== null
                ? `${chatText.elapsedLabel} ${elapsedSeconds}${chatText.seconds}`
                : chatText.waitingStage}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACTION_ORDER.map((phase, idx) => {
              const isDone = phasePointer > idx
              const isActive = phasePointer === idx
              return (
                <div
                  key={phase}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2 border ${
                    isDone
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : isActive
                      ? 'border-amber-200 bg-amber-50 text-amber-700 animate-pulse'
                      : 'border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isDone ? 'bg-green-500' : isActive ? 'bg-amber-400' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-xs font-medium">{phaseLabels[phase]}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-10">{chatText.emptyState}</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm max-w-[85%] whitespace-normal text-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-gray-50 text-gray-900 border border-gray-100'
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wide opacity-70 mb-1">
                    {msg.role === 'user' ? chatText.userLabel : chatText.assistantLabel}
                  </p>
                  {msg.role === 'assistant' ? (
                    activeAssistantId && msg.id === activeAssistantId ? (
                      hasEnteredGeneration ? (
                        <div className="prose prose-sm max-w-none text-gray-900 prose-headings:text-gray-900 prose-headings:mt-5 prose-headings:mb-3 prose-h1:mb-4 prose-h2:mb-4 prose-h3:mb-3 prose-h4:mb-3 prose-h4:text-base prose-h4:font-semibold prose-p:mt-2 prose-p:mb-3 prose-p:leading-relaxed prose-ul:mt-4 prose-ul:mb-3 prose-ol:mt-5 prose-ol:mb-4 prose-li:my-1 prose-strong:text-gray-900 prose-a:text-emerald-600 prose-hr:my-5">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.rawMarkdown || msg.content || chatText.assistantTyping}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="leading-relaxed">{chatText.assistantTyping}</p>
                      )
                    ) : (
                      <div className="prose prose-sm max-w-none text-gray-900 prose-headings:text-gray-900 prose-headings:mt-5 prose-headings:mb-3 prose-h1:mb-4 prose-h2:mb-4 prose-h3:mb-3 prose-h4:mb-3 prose-h4:text-base prose-h4:font-semibold prose-p:mt-2 prose-p:mb-3 prose-p:leading-relaxed prose-ul:mt-4 prose-ul:mb-3 prose-ol:mt-5 prose-ol:mb-4 prose-li:my-1 prose-strong:text-gray-900 prose-a:text-emerald-600 prose-hr:my-5">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.rawMarkdown || msg.content}
                        </ReactMarkdown>
                      </div>
                    )
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-white/40 p-5 space-y-3 bg-white/70 rounded-b-[32px]">
          <textarea
            rows={2}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-green-500 focus:ring focus:ring-green-100 transition resize-none"
            placeholder={chatText.inputPlaceholder}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            disabled={isStreaming || !userId}
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{isStreaming ? chatText.assistantTyping : '\u00A0'}</span>
            <button
              type="submit"
              disabled={!inputValue.trim() || isStreaming || !userId}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold shadow disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              <Send className="h-4 w-4" />
              {isStreaming ? chatText.sending : chatText.send}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Chatbox

function createMessageId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

