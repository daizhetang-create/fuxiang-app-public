export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/$/, '')
  if (!apiKey) return res.status(503).json({ error: 'AI_API_KEY is not configured' })

  try {
    const request = new Request('http://localhost/api/transcribe', {
      method: 'POST',
      headers: req.headers,
      body: req,
      duplex: 'half'
    })
    const incoming = await request.formData()
    const audio = incoming.get('audio')
    if (!(audio instanceof Blob)) return res.status(400).json({ error: 'Audio is required' })
    if (audio.size > 10 * 1024 * 1024) return res.status(413).json({ error: 'Audio exceeds the 10 MB limit' })

    const form = new FormData()
    form.append('file', audio, 'thought.webm')
    form.append('model', process.env.AI_TRANSCRIBE_MODEL || process.env.OPENAI_TRANSCRIBE_MODEL || 'FunAudioLLM/SenseVoiceSmall')
    const response = await fetch(`${baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    })

    if (!response.ok) return res.status(response.status).json({ error: await response.text() })
    const data = await response.json()
    return res.status(200).json({ text: data.text })
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
}
