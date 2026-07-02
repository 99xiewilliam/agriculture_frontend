import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SAMPLE_DIR = path.join(process.cwd(), 'public', 'rs-samples')
const PUBLIC_PREFIX = '/rs-samples'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

function listSampleImages(): string[] {
  try {
    return fs.readdirSync(SAMPLE_DIR, { withFileTypes: true })
      .filter(d => d.isFile() && d.name.toLowerCase().endsWith('.png'))
      .map(d => `${PUBLIC_PREFIX}/${encodeURIComponent(d.name)}`)
  } catch {
    return []
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const countParam = parseInt(url.searchParams.get('count') || '4', 10)
  const count = Number.isFinite(countParam) && countParam > 0 ? Math.min(countParam, 8) : 4

  const images = shuffle(listSampleImages()).slice(0, count)

  return NextResponse.json({ images })
}

