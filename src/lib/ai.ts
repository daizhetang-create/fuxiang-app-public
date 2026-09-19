import type { IdeaCard, IdeaType } from '../types'

type AIResult = Pick<IdeaCard, 'title' | 'summary' | 'type' | 'tags' | 'space' | 'nextStep'>

const typeKeywords: Array<[IdeaType, string[]]> = [
  ['demo', ['demo', '原型', '实验']],
  ['project', ['项目', '执行', '创业', '上线']],
  ['journal', ['今天', '日记', '心情']],
  ['memory', ['记得', '以前', '小时候', '回忆']],
  ['thinking', ['思考', '为什么', '本质', '观点']],
]

function mockOrganize(text: string): AIResult {
  const type = typeKeywords.find(([, words]) => words.some(word => text.toLowerCase().includes(word)))?.[0] ?? 'idea'
  const clean = text.replace(/^(我想到|收一个idea|记录一下|我觉得)[，,:：\s]*/i, '').trim()
  const title = clean.length > 24 ? `${clean.slice(0, 22)}…` : clean || '一个刚刚出现的念头'
  return {
    title,
    summary: clean.length > 68 ? `${clean.slice(0, 66)}……` : clean,
    type,
    tags: ['新想法', type === 'project' ? '行动' : '灵感', '待连接'],
    space: type === 'journal' ? '日常记录' : type === 'project' ? '创业实验' : '灵感收件箱',
    nextStep: type === 'thinking' ? '继续追问：这件事真正解决了什么？' : '用一句话写下最小验证方式',
  }
}

export async function organizeIdea(text: string): Promise<{ result: AIResult; isDemo: boolean }> {
  if (import.meta.env.VITE_PUBLIC_DEMO === 'true') {
    return { result: mockOrganize(text), isDemo: true }
  }
  try {
    const response = await fetch('/api/organize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) throw new Error('AI endpoint unavailable')
    return { result: await response.json() as AIResult, isDemo: false }
  } catch {
    await new Promise(resolve => setTimeout(resolve, 900))
    return { result: mockOrganize(text), isDemo: true }
  }
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  if (import.meta.env.VITE_PUBLIC_DEMO === 'true') {
    throw new Error('公开演示不发送录音，请使用文字输入。语音转录需要自行配置后端。')
  }
  const form = new FormData()
  form.append('audio', blob, 'thought.webm')
  const response = await fetch('/api/transcribe', { method: 'POST', body: form })
  if (!response.ok) throw new Error('语音转录尚未配置，请先使用文字输入。')
  const data = await response.json() as { text: string }
  return data.text
}
