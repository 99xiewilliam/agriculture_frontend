import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// 根目录：本地遥感PNG数据
const ROOT_DIR = '/data/xwh/Tiny-CropNet-2022/processed/png'

function getRandomItem<T>(arr: T[]): T | null {
  if (!arr.length) return null
  const idx = Math.floor(Math.random() * arr.length)
  return arr[idx] ?? null
}

function safeReaddirSync(target: string): fs.Dirent[] {
  try {
    return fs.readdirSync(target, { withFileTypes: true })
  } catch {
    return []
  }
}

// 从层级目录中快速随机挑选一张 png
function pickOnePng(root: string): string | null {
  const level1 = safeReaddirSync(root).filter(d => d.isDirectory())
  const dir1 = getRandomItem(level1)
  if (!dir1) return null

  const p1 = path.join(root, dir1.name)
  const level2 = safeReaddirSync(p1).filter(d => d.isDirectory())
  const dir2 = getRandomItem(level2)
  if (!dir2) return null

  const p2 = path.join(p1, dir2.name)
  const level3 = safeReaddirSync(p2).filter(d => d.isDirectory())
  const dir3 = getRandomItem(level3)
  if (!dir3) return null

  const p3 = path.join(p2, dir3.name)
  const files = safeReaddirSync(p3)
    .filter(d => d.isFile() && d.name.toLowerCase().endsWith('.png'))
    .map(d => path.join(p3, d.name))
  const png = getRandomItem(files)
  return png
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const countParam = parseInt(url.searchParams.get('count') || '4', 10)
  const count = Number.isFinite(countParam) && countParam > 0 ? Math.min(countParam, 8) : 4

  const images: string[] = []
  const used = new Set<string>()
  let tries = 0
  const maxTries = count * 20

  while (images.length < count && tries < maxTries) {
    tries += 1
    const filePath = pickOnePng(ROOT_DIR)
    if (!filePath || used.has(filePath)) continue
    used.add(filePath)
    try {
      const buf = fs.readFileSync(filePath)
      const dataUrl = `data:image/png;base64,${buf.toString('base64')}`
      images.push(dataUrl)
    } catch {
      // ignore bad file
    }
  }

  return NextResponse.json({ images })
}

