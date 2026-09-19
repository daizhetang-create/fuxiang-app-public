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

await replaceExact('src/App.tsx', [
  [
    `  useEffect(() => {\n    document.documentElement.dataset.theme = dark ? 'dark' : 'light'\n    localStorage.setItem('fuxiang_theme', dark ? 'dark' : 'light')\n  }, [dark])`,
    `  useEffect(() => {\n    document.documentElement.dataset.theme = dark ? 'dark' : 'light'\n    localStorage.setItem('fuxiang_theme', dark ? 'dark' : 'light')\n  }, [dark])\n  useEffect(() => {\n    const handleShortcut = (event: KeyboardEvent) => {\n      if (event.key === 'Escape') { setSelected(null); setMobileMenu(false); return }\n      if (!(event.metaKey || event.ctrlKey)) return\n      if (event.key.toLowerCase() === 'k') { event.preventDefault(); setView('capture') }\n      if (event.key.toLowerCase() === 'f') { event.preventDefault(); setView('library') }\n    }\n    window.addEventListener('keydown', handleShortcut)\n    return () => window.removeEventListener('keydown', handleShortcut)\n  }, [])`
  ],
  [
    `{view === 'today' && <TodayView ideas={ideas} onCapture={() => setView('capture')} onOpen={setSelected} />}`,
    `{view === 'today' && <TodayView ideas={ideas} onCapture={() => setView('capture')} onSearch={() => setView('library')} onConstellation={() => setView('constellation')} onOpen={setSelected} />}`
  ],
  [
    `function TodayView({ ideas, onCapture, onOpen }: { ideas: IdeaCard[]; onCapture: () => void; onOpen: (idea: IdeaCard) => void }) {`,
    `function TodayView({ ideas, onCapture, onSearch, onConstellation, onOpen }: { ideas: IdeaCard[]; onCapture: () => void; onSearch: () => void; onConstellation: () => void; onOpen: (idea: IdeaCard) => void }) {`
  ],
  [
    `<PageHeader eyebrow={today} title="晚上好，思想体验者。" subtitle="今天，有什么值得被接住？" action={<button className="header-search" aria-label="搜索"><Search size={19} /></button>} />`,
    `<PageHeader eyebrow={today} title="晚上好，思想体验者。" subtitle="今天，有什么值得被接住？" action={<button className="header-search" onClick={onSearch} aria-label="搜索"><Search size={19} /></button>} />`
  ],
  [
    `<section className="capture-hero" onClick={onCapture} tabIndex={0} role="button">`,
    `<section className="capture-hero" onClick={onCapture} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onCapture() } }} tabIndex={0} role="button" aria-label="打开快速捕获">`
  ],
  [
    `<div className="resurface-footer"><span><Link2 size={14} /> 与 4 个最近的想法有关</span><div><button aria-label="上一条"><ArrowLeft size={15} /></button><button aria-label="下一条"><ArrowRight size={15} /></button></div></div>`,
    `<div className="resurface-footer"><span><Link2 size={14} /> 与 4 个最近的想法有关</span><span className="soft-label">每日一条</span></div>`
  ],
  [
    `<div className="section-title"><div><span className="eyebrow">GROWING NOW</span><h2>正在生长</h2></div><button><MoreHorizontal size={18} /></button></div>`,
    `<div className="section-title"><div><span className="eyebrow">GROWING NOW</span><h2>正在生长</h2></div><span className="soft-label">本周</span></div>`
  ],
  [
    `<button className="quiet-link" onClick={() => onOpen(ideas[0])}>查看思想脉络 <ChevronRight size={15} /></button>`,
    `<button className="quiet-link" onClick={onConstellation}>查看思想脉络 <ChevronRight size={15} /></button>`
  ],
  [
    `<button className="quiet-link">全部想法 <ArrowRight size={15} /></button>`,
    `<button className="quiet-link" onClick={onSearch}>全部想法 <ArrowRight size={15} /></button>`
  ],
  [
    `<div className="sidebar-label-row"><span className="sidebar-label">我的空间</span><button aria-label="新建空间"><Plus size={14} /></button></div>`,
    `<div className="sidebar-label-row"><span className="sidebar-label">我的空间</span><button aria-label="捕获新想法" onClick={() => onNavigate('capture')}><Plus size={14} /></button></div>`
  ],
  [
    `<button><i className="space-dot violet" />浮想产品<span>12</span></button>\n          <button><i className="space-dot coral" />创业实验<span>7</span></button>\n          <button><i className="space-dot lime" />日常记录<span>5</span></button>`,
    `<button onClick={() => onNavigate('library')}><i className="space-dot violet" />浮想产品<span>12</span></button>\n          <button onClick={() => onNavigate('library')}><i className="space-dot coral" />创业实验<span>7</span></button>\n          <button onClick={() => onNavigate('library')}><i className="space-dot lime" />日常记录<span>5</span></button>`
  ],
  [
    `<button className="filter-button"><FolderHeart size={16} /> 全部空间 <ChevronDown size={15} /></button>`,
    `<span className="filter-button"><FolderHeart size={16} /> 全部空间</span>`
  ],
  [
    `action={<button className="filter-button"><Compass size={16} /> 最近 90 天 <ChevronDown size={15} /></button>}`,
    `action={<span className="filter-button"><Compass size={16} /> 最近 90 天</span>}`
  ],
  [
    `<button className="ghost-button"><UserRound size={16} /> 编辑资料</button>`,
    `<span className="status-pill online"><i />v1.0.0</span>`
  ],
  [
    `<div className="setting-row"><span><strong>文本整理</strong><small>低成本结构化模型</small></span><em className="status-pill online"><i />已预留接口</em></div>`,
    `<div className="setting-row"><span><strong>文本整理</strong><small>Kimi K2.6 · 硅基流动</small></span><em className="status-pill online"><i />接口完成</em></div>`
  ],
  [
    `<div className="setting-row"><span><strong>语音转录</strong><small>中文语音转文字</small></span><em className="status-pill online"><i />已预留接口</em></div>`,
    `<div className="setting-row"><span><strong>语音转录</strong><small>SenseVoice · 硅基流动</small></span><em className="status-pill online"><i />接口完成</em></div>`
  ],
  [
    `<div className="setting-row"><span><strong>服务状态</strong><small>部署后填写 OPENAI_API_KEY</small></span><em className="status-pill"><i />等待密钥</em></div>`,
    `<div className="setting-row"><span><strong>服务状态</strong><small>部署后填写 AI_API_KEY</small></span><em className="status-pill"><i />等待密钥</em></div>`
  ],
  [
    `<button className="setting-row interactive"><span><strong>提醒与浮现</strong><small>每天 20:30 · 3 条</small></span><ChevronRight size={17} /></button>`,
    `<div className="setting-row"><span><strong>提醒与浮现</strong><small>计划在 v1.1 接入</small></span><em className="status-pill"><i />即将开放</em></div>`
  ],
  [
    `<button className="setting-row interactive"><span><strong>数据与隐私</strong><small>导出、删除、AI 处理授权</small></span><ChevronRight size={17} /></button>`,
    `<div className="setting-row"><span><strong>数据与隐私</strong><small>RLS 隔离 · 支持单条删除</small></span><em className="status-pill online"><i />已启用</em></div>`
  ],
  [
    `<div className="drawer-toolbar"><button className="icon-button" onClick={onClose}><X size={18} /></button><div><button className="icon-button"><Link2 size={17} /></button><button className="icon-button"><MoreHorizontal size={18} /></button></div></div>`,
    `<div className="drawer-toolbar"><button className="icon-button" onClick={onClose} aria-label="关闭详情"><X size={18} /></button><span className="soft-label">思想详情</span></div>`
  ],
  [
    `<button><Check size={14} /> 标记为行动</button>`,
    `<span className="status-pill"><i />轻量下一步</span>`
  ],
  [
    `<button><Headphones size={15} /> 原始录音</button>`,
    `<button disabled title="录音文件保存将在 v1.1 接入"><Headphones size={15} /> 暂无原始录音</button>`
  ]
])

await replaceExact('index.html', [
  [
    `<meta name="theme-color" content="#f2f0e9" />`,
    `<meta name="theme-color" content="#f2f0e9" />\n    <meta name="application-name" content="浮想" />\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-status-bar-style" content="default" />\n    <link rel="manifest" href="/manifest.webmanifest" />\n    <link rel="icon" href="/fuxiang-icon.svg" type="image/svg+xml" />`
  ]
])

await replaceExact('src/main.tsx', [
  [
    `createRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)`,
    `createRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)\n\nif ('serviceWorker' in navigator && import.meta.env.PROD) {\n  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))\n}`
  ]
])

await replaceExact('package.json', [
  [`"version": "0.1.0"`, `"version": "1.0.0"`],
  [
    `"preview": "vite preview"`,
    `"preview": "vite preview",\n    "check": "node scripts/check-project.mjs && npm run build"`
  ]
])
