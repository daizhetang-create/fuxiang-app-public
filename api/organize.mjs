export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/$/, '')
  if (!apiKey) return res.status(503).json({ error: 'AI_API_KEY is not configured' })

  const text = String(req.body?.text ?? '').trim()
  if (!text || text.length > 12000) return res.status(400).json({ error: 'Invalid text' })

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.AI_TEXT_MODEL || process.env.OPENAI_TEXT_MODEL || 'Pro/moonshotai/Kimi-K2.6',
        temperature: 0.35,
        messages: [
          {
            role: 'system',
            content: `你是“浮想”的思想编辑。把中文口述整理成忠于原意、简洁、有温度的思想卡片。不要虚构。只返回一个 JSON 对象，不要使用 Markdown。字段必须是：title、summary、type、tags、space、nextStep。type 只能是 idea、thinking、project、demo、journal、memory 之一；tags 为 2 到 5 个短标签；space 是简短主题空间；nextStep 必须具体且轻量。`
          },
          { role: 'user', content: text }
        ],
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) return res.status(response.status).json({ error: await response.text() })
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    const result = JSON.parse(cleaned)
    const allowed = new Set(['idea', 'thinking', 'project', 'demo', 'journal', 'memory'])
    if (!result.title || !result.summary || !allowed.has(result.type) || !Array.isArray(result.tags)) {
      throw new Error('Model returned an invalid idea card')
    }
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
}
