'use client'

import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip as ReTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { MOCK_CROPDIS_DATA, type CropDisDataset } from '@/data/mock_data'
import { useAppStore } from '@/store/appStore'
import Chatbox from './chatbox'

const COLORS = ['#10b981', '#60a5fa', '#f59e0b', '#ef4444', '#a78bfa', '#14b8a6']

interface CropDisProps {
  open: boolean
  fips: string | null
  countyName?: string | null
  onClose: () => void
}

function generateUserId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) return window.crypto.randomUUID()
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function CropDis({ open, fips, countyName, onClose }: CropDisProps) {
  const { language } = useAppStore()

  const [askText, setAskText] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [chatPrompt, setChatPrompt] = useState<string | null>(null)
  const [chatUserId, setChatUserId] = useState<string | null>(null)
  // 拖拽相关
  const boxRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 })
  const [zIndex, setZIndex] = useState<number>(45)

  // 所有 hooks 都应在任何 early return 之前调用
  const data: CropDisDataset | undefined = useMemo(() => {
    return fips ? MOCK_CROPDIS_DATA[fips] : undefined
  }, [fips])

  const i18n = {
    title: language === 'zh' ? '作物分布与价格走势' : 'Crop Mix & Price Outlook',
    dist: language === 'zh' ? '作物面积分布' : 'Crop Area Distribution',
    price: language === 'zh' ? '按作物未来价格走势（USD/bu）' : 'Per-Crop Price Forecast (USD/bu)',
    ask: language === 'zh' ? '向 Copilot 追问' : 'Ask Copilot',
    placeholder: language === 'zh' ? '在此输入你的问题，例如：未来两周风险？' : 'Type your question, e.g., Risks in next 2 weeks?',
  }

  // 价格多系列（按作物）整形为 Recharts 可用的扁平表
  const { chartData, lineKeys } = useMemo(() => {
    if (!data) return { chartData: [], lineKeys: [] as string[] }
    if (data.priceByCrop && Object.keys(data.priceByCrop).length > 0) {
      const entries = Object.entries(data.priceByCrop)
      // 假设各作物序列长度与日期对齐，按最短长度对齐
      const minLen = Math.min(...entries.map(([, series]) => series.length))
      const points: Array<Record<string, string | number>> = []
      for (let i = 0; i < minLen; i += 1) {
        const row: Record<string, string | number> = { date: entries[0][1][i].date }
        for (const [crop, series] of entries) {
          row[crop] = series[i].price_usd
        }
        points.push(row)
      }
      return { chartData: points, lineKeys: entries.map(([crop]) => crop) }
    }
    // 兼容旧结构（单一价格序列）
    return {
      chartData: data.priceForecast.map(p => ({ date: p.date, Price: p.price_usd })),
      lineKeys: ['Price']
    }
  }, [data])

  // 初始位置：打开时居中
  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const rect = boxRef.current?.getBoundingClientRect()
      const width = rect?.width ?? Math.min(1100, vw - 24)
      const height = rect?.height ?? Math.min(Math.floor(vh * 0.92), vh - 24)
      const x = Math.max(12, Math.round((vw - width) / 2))
      const y = Math.max(12, Math.round((vh - height) / 2))
      setPosition({ x, y })
    })
  }, [open])

  // 拖拽移动
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
      // 置顶本弹窗层级
      setZIndex((prev) => (prev < 60 ? 60 : prev + 1))
      dragOffsetRef.current = { dx: e.clientX - position.x, dy: e.clientY - position.y }
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
    },
    [position.x, position.y]
  )

  const gradientDefs = useMemo(() => (
    <defs>
      {COLORS.map((c, idx) => (
        <linearGradient id={`sliceGrad-${idx}`} x1="0" y1="0" x2="0" y2="1" key={idx}>
          <stop offset="0%" stopColor={c} stopOpacity={1} />
          <stop offset="100%" stopColor={c} stopOpacity={0.6} />
        </linearGradient>
      ))}
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.35" />
      </filter>
    </defs>
  ), [])

  const buildCopilotPrompt = useCallback(() => {
    if (!data) return ''
    const header = language === 'zh'
      ? `${data.county} 的作物分布与未来价格走势`
      : `Crop mix and price outlook for ${data.county}`
    const distLines = data.distribution
      .map(d => `${d.crop}: ${d.area_pct}%`)
      .join('\n')
    const priceLines = (data.priceByCrop && Object.keys(data.priceByCrop).length > 0)
      ? Object.entries(data.priceByCrop)
          .map(([crop, series]) =>
            `${crop}:\n` + series.map(p => `${p.date}: $${p.price_usd}`).join('\n')
          )
          .join('\n\n')
      : data.priceForecast.map(p => `${p.date}: $${p.price_usd}`).join('\n')
    const question = askText?.trim() ? `\n\nQuestion: ${askText.trim()}` : ''
    return `${header}

Crop Mix:
${distLines}

Price Forecast (USD/bu):
${priceLines}${question}
`
  }, [data, language, askText])

  const openCopilot = () => {
    const prompt = buildCopilotPrompt()
    // 先生成/确定 userId，再打开，避免首开时 userId 为空导致 useEffect 跳过
    const ensuredId = chatUserId ?? generateUserId()
    setChatUserId(ensuredId)
    setChatPrompt(prompt)
    setChatOpen(true)
  }

  if (!open || !fips || !data) return null

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex }}>
      {/* 半透明背景，仅作视觉，不阻挡交互 */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      <div
        ref={boxRef}
        className="pointer-events-auto fixed bg-white rounded-2xl shadow-2xl border border-white/40 max-w-6xl w-[min(96vw,1100px)] max-h-[92vh] overflow-hidden"
        style={{ left: position.x, top: position.y }}
      >
        <button
          type="button"
          onClick={onClose}
          onPointerDown={(e) => { e.stopPropagation() }}
          onMouseDown={(e) => { e.stopPropagation() }}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Close crop distribution"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        <div
          className={`p-5 border-b border-gray-100 ${dragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
          onPointerDown={onHeaderPointerDown}
        >
          <h3 className="text-lg font-bold text-gray-900">
            {(countyName || data.county)} · {i18n.title}
          </h3>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 作物分布饼图（带立体渐变与阴影，实现“3D-like”观感） */}
          <div className="card-clean p-4">
            <div className="text-sm font-semibold text-gray-700 mb-3">{i18n.dist}</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {gradientDefs}
                  <Pie
                    data={data.distribution}
                    dataKey="area_pct"
                    nameKey="crop"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={92}
                    stroke="#ffffff"
                    strokeWidth={2}
                    label={({ name, percent }: any) => `${name} ${Number(percent * 100).toFixed(0)}%`}
                    style={{ filter: 'url(#shadow)' } as any}
                  >
                    {data.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#sliceGrad-${index})`} />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(v: any, n: any) => [`${v}%`, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 未来价格走势 */}
          <div className="card-clean p-4">
            <div className="text-sm font-semibold text-gray-700 mb-3">{i18n.price}</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                  <ReTooltip />
                  <Legend />
                  {lineKeys.map((key, idx) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Copilot 入口 */}
        <div className="px-5 pb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              placeholder={i18n.placeholder}
              className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50/50 text-gray-900 transition-all"
            />
            <button
              type="button"
              onClick={openCopilot}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition"
            >
              <MessageCircle className="w-4 h-4" />
              {i18n.ask}
            </button>
          </div>
        </div>
      </div>

      {/* Chatbox 弹窗（流式） */}
      <Chatbox
        key={(chatUserId || 'no-id') + ':' + (chatPrompt || '')}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        initialPrompt={chatPrompt}
        userId={chatUserId}
        language={language}
      />
    </div>
  )
}

