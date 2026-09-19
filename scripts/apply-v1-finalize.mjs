import { readFile, writeFile } from 'node:fs/promises'

async function replaceExact(file, replacements) {
  let source = await readFile(file, 'utf8')
  for (const [before, after] of replacements) {
    if (!source.includes(before)) throw new Error(`${file}: replacement target not found`)
    source = source.replace(before, after)
  }
  await writeFile(file, source, 'utf8')
  console.log(`updated ${file}`)
}

await replaceExact('src/main.tsx', [[
  `ReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)`,
  `ReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)\n\nif ('serviceWorker' in navigator && import.meta.env.PROD) {\n  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))\n}`
]])

await replaceExact('package.json', [
  [`"version": "0.1.0"`, `"version": "1.0.0"`],
  [`"preview": "vite preview"`, `"preview": "vite preview",\n    "check": "node scripts/check-project.mjs && npm run build"`]
])

await replaceExact('src/App.tsx', [
  [`  ArrowLeft, ArrowRight, AudioLines, BookOpen, Brain, Check, ChevronDown, ChevronRight,`, `  ArrowRight, AudioLines, BookOpen, Brain, Check, ChevronRight,`],
  [`  Send, Settings, Sparkles, Square, Sun, Tag, Trash2, UserRound, WandSparkles, X,`, `  Send, Settings, Sparkles, Square, Sun, Tag, Trash2, WandSparkles, X,`],
  [
    `  useEffect(() => {\n    if (!recording) return\n    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000)\n    return () => window.clearInterval(timer)\n  }, [recording])`,
    `  useEffect(() => {\n    if (!recording) return\n    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000)\n    return () => window.clearInterval(timer)\n  }, [recording])\n  useEffect(() => {\n    if (recording && seconds >= 180) { recorder.current?.stop(); setRecording(false); setMessage('单次录音最长 3 分钟，已自动停止。') }\n  }, [recording, seconds])`
  ],
  [`<textarea value={text} onChange={event => setText(event.target.value)} placeholder="写下一段还没有整理好的想法……" rows={4} />`, `<textarea value={text} onChange={event => setText(event.target.value)} placeholder="写下一段还没有整理好的想法……" maxLength={12000} rows={4} />`]
])

await replaceExact('api/transcribe.mjs', [[
  `    if (!(audio instanceof Blob)) return res.status(400).json({ error: 'Audio is required' })`,
  `    if (!(audio instanceof Blob)) return res.status(400).json({ error: 'Audio is required' })\n    if (audio.size > 10 * 1024 * 1024) return res.status(413).json({ error: 'Audio exceeds the 10 MB limit' })`
]])
