export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const configured = Boolean(process.env.AI_API_KEY || process.env.OPENAI_API_KEY)
  return res.status(200).json({
    configured,
    provider: 'SiliconFlow',
    textModel: process.env.AI_TEXT_MODEL || process.env.OPENAI_TEXT_MODEL || 'Pro/moonshotai/Kimi-K2.6',
    transcribeModel: process.env.AI_TRANSCRIBE_MODEL || process.env.OPENAI_TRANSCRIBE_MODEL || 'FunAudioLLM/SenseVoiceSmall',
  })
}
