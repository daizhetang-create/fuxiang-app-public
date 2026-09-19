import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, AudioLines, BookOpen, Brain, Check, ChevronRight,
  CircleDot, Command, Compass, Feather, FolderHeart, Headphones, Home, Layers3, Link2,
  LogOut, Menu, MessageCircle, Mic, Moon, MoreHorizontal, Network, Pause, Plus, Search,
  Send, Settings, Sparkles, Square, Sun, Tag, Trash2, WandSparkles, X,
} from 'lucide-react'
import { enterDemo, getSession, signIn, signOut, signUp } from './lib/auth'
import { organizeIdea, transcribeAudio } from './lib/ai'
import { listIdeas, removeIdea, saveIdea } from './lib/repository'
import { isCloudConfigured } from './lib/supabase'
import { seedIdeas, topicClusters } from './mockData'
import { STAGE_LABELS, TYPE_LABELS, type IdeaCard, type IdeaType, type UserSession, type ViewName } from './types'

const navItems: Array<{ id: ViewName; label: string; icon: typeof Home }> = [
  { id: 'today', label: '今天', icon: Home },
  { id: 'capture', label: '说出来', icon: AudioLines },
  { id: 'library', label: '想法库', icon: Layers3 },
  { id: 'constellation', label: '思想脉络', icon: Network },
]

const colorOrder: IdeaCard['color'][] = ['lime', 'violet', 'coral', 'blue', 'sand']

function App() {
  const [session, setSession] = useState<UserSession | null | undefined>(undefined)
  const [ideas, setIdeas] = useState<IdeaCard[]>(seedIdeas)
  const [view, setView] = useState<ViewName>('today')
  const [dark, setDark] = useState(() => localStorage.getItem('fuxiang_theme') === 'dark')
  const [selected, setSelected] = useState<IdeaCard | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => { getSession().then(setSession) }, [])
  useEffect(() => {
    if (!session) return
    listIdeas(session.id).then(setIdeas).catch(() => setIdeas(seedIdeas))
  }, [session])
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('fuxiang_theme', dark ? 'dark' : 'light')
  }, [dark])
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setSelected(null); setMobileMenu(false); return }
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key.toLowerCase() === 'k') { event.preventDefault(); setView('capture') }
      if (event.key.toLowerCase() === 'f') { event.preventDefault(); setView('library') }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const addIdea = async (idea: IdeaCard) => {
    setIdeas(current => [idea, ...current])
    await saveIdea(idea, session?.id)
  }

  const deleteIdea = async (id: string) => {
    setIdeas(current => current.filter(item => item.id !== id))
    setSelected(null)
    await removeIdea(id, session?.id)
  }

  if (session === undefined) return <LaunchScreen />
  if (!session) return <AuthScreen onAuthenticated={setSession} dark={dark} onToggleTheme={() => setDark(!dark)} />

  return (
    <div className="app-shell">
      <Sidebar
        active={view}
        onNavigate={next => { setView(next); setMobileMenu(false) }}
        session={session}
        dark={dark}
        onToggleTheme={() => setDark(!dark)}
        mobileOpen={mobileMenu}
      />
      {mobileMenu && <button className="menu-backdrop" aria-label="关闭菜单" onClick={() => setMobileMenu(false)} />}

      <main className="main-stage">
        <header className="mobile-header">
          <button className="icon-button" onClick={() => setMobileMenu(true)} aria-label="打开菜单"><Menu size={19} /></button>
          <Brand compact />
          <button className="avatar avatar-small" onClick={() => setView('profile')}>{session.name.slice(0, 1).toUpperCase()}</button>
        </header>

        {view === 'today' && <TodayView name={session.name} ideas={ideas} onCapture={() => setView('capture')} onSearch={() => setView('library')} onConstellation={() => setView('constellation')} onOpen={setSelected} />}
        {view === 'capture' && <CaptureView ideas={ideas} onAdd={addIdea} onOpen={setSelected} />}
        {view === 'library' && <LibraryView ideas={ideas} onOpen={setSelected} onCapture={() => setView('capture')} />}
        {view === 'constellation' && <ConstellationView ideas={ideas} onOpen={setSelected} />}
        {view === 'profile' && (
          <ProfileView session={session} ideas={ideas} cloud={isCloudConfigured} dark={dark} onToggleTheme={() => setDark(!dark)} onSignOut={async () => { await signOut(); setSession(null) }} />
        )}
      </main>

      <nav className="mobile-nav" aria-label="移动端主导航">
        {navItems.map(item => {
          const Icon = item.icon
          if (item.id === 'capture') return (
            <button key={item.id} className="mobile-capture" onClick={() => setView('capture')} aria-label="说出来"><Mic size={22} /></button>
          )
          return (
            <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}>
              <Icon size={19} /><span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {selected && <IdeaDrawer idea={selected} ideas={ideas} onClose={() => setSelected(null)} onDelete={() => deleteIdea(selected.id)} onOpen={setSelected} />}
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <span className="brand-mark"><span>浮</span></span>
      <div><strong>浮想</strong>{!compact && <small>THOUGHTS, ALIVE.</small>}</div>
    </div>
  )
}

function LaunchScreen() {
  return <div className="launch"><div className="launch-mark">浮</div><p>正在打开你的思想空间</p></div>
}

function AuthScreen({ onAuthenticated, dark, onToggleTheme }: { onAuthenticated: (user: UserSession) => void; dark: boolean; onToggleTheme: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const user = mode === 'login' ? await signIn(email, password) : await signUp(name, email, password)
      onAuthenticated(user)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '暂时无法继续，请稍后再试。')
    } finally { setBusy(false) }
  }

  return (
    <div className="auth-page">
      <button className="theme-float" onClick={onToggleTheme} aria-label="切换主题">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
      <section className="auth-story">
        <Brand />
        <div className="auth-statement">
          <span className="eyebrow">YOUR PRIVATE THOUGHT GARDEN</span>
          <h1>让每一个念头，<br />都有继续生长的地方。</h1>
          <p>不必整理，不必想好。开口说，浮想会替你接住、理解，并在未来重新带回它。</p>
        </div>
        <div className="auth-orbits" aria-hidden="true">
          <i className="orbit orbit-one" /><i className="orbit orbit-two" /><i className="orbit orbit-three" />
          <span className="orbit-word word-one">灵感</span><span className="orbit-word word-two">连接</span><span className="orbit-word word-three">生长</span>
        </div>
        <blockquote>“思想不是文件。它是一种仍在发生的生命。”</blockquote>
      </section>
      <section className="auth-panel">
        <div className="auth-box">
          <div className="auth-heading">
            <span className="mini-symbol">✦</span>
            <h2>{mode === 'login' ? '欢迎回来' : '建立你的思想空间'}</h2>
            <p>{mode === 'login' ? '继续上一次没有说完的思考。' : '第一颗种子，只需要一句话。'}</p>
          </div>
          <form onSubmit={submit}>
            {mode === 'signup' && <label><span>你的称呼</span><input value={name} onChange={event => setName(event.target.value)} placeholder="怎么称呼你" required /></label>}
            <label><span>邮箱</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
            <label><span>密码</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="至少 6 位" minLength={6} required /></label>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button auth-submit" disabled={busy}>{busy ? '正在进入…' : mode === 'login' ? '进入浮想' : '创建空间'}<ArrowRight size={17} /></button>
          </form>
          <div className="auth-divider"><span>或者</span></div>
          <button className="ghost-button full" onClick={() => onAuthenticated(enterDemo())}>直接体验演示空间 <Sparkles size={16} /></button>
          <p className="switch-auth">{mode === 'login' ? '第一次来到这里？' : '已经有空间了？'} <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? '免费注册' : '直接登录'}</button></p>
          {!isCloudConfigured && <div className="demo-notice"><CircleDot size={14} /> 当前为本地演示模式，接入 Supabase 后自动启用云账号。</div>}
        </div>
      </section>
    </div>
  )
}

function Sidebar({ active, onNavigate, session, dark, onToggleTheme, mobileOpen }: {
  active: ViewName; onNavigate: (view: ViewName) => void; session: UserSession; dark: boolean; onToggleTheme: () => void; mobileOpen: boolean
}) {
  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <Brand />
      <div className="sidebar-section">
        <span className="sidebar-label">思想空间</span>
        <nav>
          {navItems.map(item => {
            const Icon = item.icon
            return <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}><Icon size={18} /><span>{item.label}</span>{item.id === 'capture' && <kbd>⌘ K</kbd>}</button>
          })}
        </nav>
      </div>
      <div className="sidebar-section spaces-section">
        <div className="sidebar-label-row"><span className="sidebar-label">我的空间</span><button aria-label="捕获新想法" onClick={() => onNavigate('capture')}><Plus size={14} /></button></div>
        <div className="space-list">
          <button onClick={() => onNavigate('library')}><i className="space-dot violet" />浮想产品<span>12</span></button>
          <button onClick={() => onNavigate('library')}><i className="space-dot coral" />创业实验<span>7</span></button>
          <button onClick={() => onNavigate('library')}><i className="space-dot lime" />日常记录<span>5</span></button>
        </div>
      </div>
      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={onToggleTheme}><span>{dark ? <Moon size={15} /> : <Sun size={15} />}{dark ? '深夜模式' : '日间模式'}</span><i className={dark ? 'on' : ''}><b /></i></button>
        <button className={`user-chip ${active === 'profile' ? 'active' : ''}`} onClick={() => onNavigate('profile')}>
          <span className="avatar">{session.name.slice(0, 1).toUpperCase()}</span>
          <span><strong>{session.name}</strong><small>{session.demo ? '体验空间' : session.email}</small></span>
          <MoreHorizontal size={17} />
        </button>
      </div>
    </aside>
  )
}

function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return <header className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</header>
}

function TodayView({ name, ideas, onCapture, onSearch, onConstellation, onOpen }: { name: string; ideas: IdeaCard[]; onCapture: () => void; onSearch: () => void; onConstellation: () => void; onOpen: (idea: IdeaCard) => void }) {
  const now = new Date()
  const today = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(now)
  const hour = now.getHours()
  const greeting = hour < 5 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'
  const resurfaced = ideas.find(idea => idea.resurfaced) ?? ideas[0]
  return (
    <div className="view today-view">
      <PageHeader eyebrow={today} title={`${greeting}，${name}。`} subtitle="今天，有什么值得被接住？" action={<button className="header-search" onClick={onSearch} aria-label="搜索"><Search size={19} /></button>} />
      <section className="capture-hero" onClick={onCapture} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onCapture() } }} tabIndex={0} role="button" aria-label="打开快速捕获">
        <div className="capture-copy">
          <span className="soft-label"><Sparkles size={13} /> 快速捕获</span>
          <h2>不用想好，<br />先说出来。</h2>
          <p>我会替你整理、命名，并找到它与过去的联系。</p>
        </div>
        <div className="voice-sculpture" aria-hidden="true">
          <span className="halo halo-one" /><span className="halo halo-two" />
          <div className="voice-main"><Mic size={28} /><span>点击开始</span></div>
          <div className="wave-lines">{Array.from({ length: 17 }).map((_, index) => <i key={index} style={{ height: `${12 + ((index * 17) % 38)}px` }} />)}</div>
        </div>
        <span className="hero-shortcut"><Command size={13} /> K</span>
      </section>

      <section className="daily-grid">
        <div className="resurface-card">
          <div className="section-title"><div><span className="eyebrow">RESURFACE</span><h2>今日浮现</h2></div><span className="day-count">128 天前</span></div>
          {resurfaced && <button className="resurface-content" onClick={() => onOpen(resurfaced)}>
            <span className={`type-token ${resurfaced.color}`}>{TYPE_LABELS[resurfaced.type]}</span>
            <h3>“{resurfaced.title}”</h3>
            <p>{resurfaced.summary}</p>
            <span className="read-link">重新看看 <ArrowRight size={16} /></span>
          </button>}
          <div className="resurface-footer"><span><Link2 size={14} /> 与 4 个最近的想法有关</span><span className="soft-label">每日一条</span></div>
        </div>
        <div className="growth-card">
          <div className="section-title"><div><span className="eyebrow">GROWING NOW</span><h2>正在生长</h2></div><span className="soft-label">本周</span></div>
          <div className="topic-bars">
            {[['AI 思想库', 18, 92, 'violet'], ['语音入口', 14, 72, 'lime'], ['重新浮现', 11, 58, 'coral']].map(([name, count, width, color]) => (
              <button key={name as string}><span><i className={`space-dot ${color}`} />{name}</span><b>{count}</b><div><i className={color as string} style={{ width: `${width}%` }} /></div></button>
            ))}
          </div>
          <button className="quiet-link" onClick={onConstellation}>查看思想脉络 <ChevronRight size={15} /></button>
        </div>
      </section>

      <section className="recent-section">
        <div className="section-title"><div><span className="eyebrow">RECENT CAPTURES</span><h2>最近记录</h2></div><button className="quiet-link" onClick={onSearch}>全部想法 <ArrowRight size={15} /></button></div>
        <div className="idea-row">
          {ideas.slice(0, 3).map(idea => <IdeaCardView key={idea.id} idea={idea} onClick={() => onOpen(idea)} />)}
        </div>
      </section>
    </div>
  )
}

function CaptureView({ ideas, onAdd, onOpen }: { ideas: IdeaCard[]; onAdd: (idea: IdeaCard) => Promise<void>; onOpen: (idea: IdeaCard) => void }) {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [latest, setLatest] = useState<IdeaCard | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  useEffect(() => {
    if (!recording) return
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [recording])
  useEffect(() => {
    if (recording && seconds >= 180) { recorder.current?.stop(); setRecording(false); setMessage('单次录音最长 3 分钟，已自动停止。') }
  }, [recording, seconds])

  const submitText = async () => {
    if (!text.trim() || processing) return
    setProcessing(true); setMessage('正在理解这段想法…')
    const { result, isDemo } = await organizeIdea(text.trim())
    const related = ideas.filter(idea => idea.tags.some(tag => result.tags.includes(tag))).slice(0, 3).map(idea => idea.id)
    const idea: IdeaCard = {
      id: crypto.randomUUID(), raw: text.trim(), ...result, stage: 'seed', createdAt: new Date().toISOString(),
      color: colorOrder[ideas.length % colorOrder.length], relatedIds: related,
    }
    await onAdd(idea)
    setLatest(idea); setText(''); setProcessing(false)
    setMessage(isDemo ? '已用本地演示引擎整理。接入 API 后将自动切换为真实 AI。' : '已由 AI 整理并保存。')
  }

  const startRecording = async () => {
    setMessage('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      chunks.current = []
      mediaRecorder.ondataavailable = event => { if (event.data.size) chunks.current.push(event.data) }
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        const blob = new Blob(chunks.current, { type: mediaRecorder.mimeType || 'audio/webm' })
        setProcessing(true); setMessage('正在把声音变成文字…')
        try {
          const transcript = await transcribeAudio(blob)
          setText(transcript); setMessage('转录完成，再看一眼或直接生成卡片。')
        } catch (error) {
          setMessage(error instanceof Error ? error.message : '暂时无法转录。')
        } finally { setProcessing(false) }
      }
      recorder.current = mediaRecorder; mediaRecorder.start(); setSeconds(0); setRecording(true)
    } catch { setMessage('需要麦克风权限才能开始口述。') }
  }

  const stopRecording = () => { recorder.current?.stop(); setRecording(false) }

  return (
    <div className="view capture-view">
      <PageHeader eyebrow="CAPTURE A THOUGHT" title="此刻，你在想什么？" subtitle="不用组织语言。说得越自然，越接近你真正的想法。" />
      <section className={`capture-studio ${recording ? 'is-recording' : ''}`}>
        <div className="studio-orbit"><span /><span /><span /></div>
        <div className="record-state">
          <span className="record-kicker">{recording ? '正在聆听' : processing ? '正在整理' : '准备好了'}</span>
          <button className="record-button" onClick={recording ? stopRecording : startRecording} disabled={processing}>
            {recording ? <Square size={27} fill="currentColor" /> : processing ? <WandSparkles size={28} /> : <Mic size={30} />}
          </button>
          <div className="live-wave">{Array.from({ length: 31 }).map((_, index) => <i key={index} style={{ animationDelay: `${index * -0.06}s` }} />)}</div>
          <strong className="record-time">{recording ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : '轻触开始口述'}</strong>
          <p>{recording ? '想到哪里，就说到哪里' : '或者在下方直接输入文字'}</p>
        </div>
      </section>

      <section className="thought-composer">
        <textarea value={text} onChange={event => setText(event.target.value)} placeholder="写下一段还没有整理好的想法……" maxLength={12000} rows={4} />
        <div className="composer-footer">
          <span>{message || '原始表达会被完整保留'}</span>
          <button className="primary-button" onClick={submitText} disabled={!text.trim() || processing}>{processing ? '正在理解…' : '生成思想卡片'} <Send size={16} /></button>
        </div>
      </section>

      {latest && <section className="latest-result">
        <div className="result-heading"><span><Check size={15} /> 已接住</span><button onClick={() => setLatest(null)}><X size={16} /></button></div>
        <button className="result-card" onClick={() => onOpen(latest)}>
          <span className={`type-token ${latest.color}`}>{TYPE_LABELS[latest.type]}</span>
          <div><h3>{latest.title}</h3><p>{latest.summary}</p><div className="tag-list">{latest.tags.map(tag => <span key={tag}>#{tag}</span>)}</div></div>
          <ArrowRight size={19} />
        </button>
      </section>}
    </div>
  )
}

function LibraryView({ ideas, onOpen, onCapture }: { ideas: IdeaCard[]; onOpen: (idea: IdeaCard) => void; onCapture: () => void }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | IdeaType>('all')
  const filtered = useMemo(() => ideas.filter(idea => {
    const matchesText = `${idea.title}${idea.summary}${idea.tags.join('')}`.toLowerCase().includes(query.toLowerCase())
    return matchesText && (filter === 'all' || idea.type === filter)
  }), [ideas, query, filter])

  return (
    <div className="view library-view">
      <PageHeader eyebrow="YOUR THOUGHTS" title="想法库" subtitle={`${ideas.length} 个念头正在这里生长`} action={<button className="primary-button" onClick={onCapture}><Plus size={17} /> 新想法</button>} />
      <div className="library-toolbar">
        <label className="search-field"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="描述你记得的内容……" /><kbd>⌘ F</kbd></label>
        <span className="filter-button"><FolderHeart size={16} /> 全部空间</span>
      </div>
      <div className="filter-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>全部 <span>{ideas.length}</span></button>
        {(Object.keys(TYPE_LABELS) as IdeaType[]).map(type => <button key={type} className={filter === type ? 'active' : ''} onClick={() => setFilter(type)}>{TYPE_LABELS[type]} <span>{ideas.filter(idea => idea.type === type).length}</span></button>)}
      </div>
      {filtered.length ? <div className="library-grid">{filtered.map(idea => <IdeaCardView key={idea.id} idea={idea} onClick={() => onOpen(idea)} detailed />)}</div> : <div className="empty-state"><Feather size={30} /><h3>这里还没有这样的想法</h3><p>换个词搜索，或者现在说一个新的。</p></div>}
    </div>
  )
}

function IdeaCardView({ idea, onClick, detailed = false }: { idea: IdeaCard; onClick: () => void; detailed?: boolean }) {
  const date = new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }).format(new Date(idea.createdAt))
  return (
    <button className={`idea-card color-${idea.color} ${detailed ? 'detailed' : ''}`} onClick={onClick}>
      <div className="idea-card-top"><span className={`type-token ${idea.color}`}>{TYPE_LABELS[idea.type]}</span><MoreHorizontal size={17} /></div>
      <h3>{idea.title}</h3>
      <p>{idea.summary}</p>
      <div className="tag-list">{idea.tags.slice(0, 3).map(tag => <span key={tag}>#{tag}</span>)}</div>
      <div className="idea-card-foot"><span>{date}</span><span><i className={`stage-dot ${idea.stage}`} />{STAGE_LABELS[idea.stage]}</span>{idea.relatedIds?.length ? <span><Link2 size={13} /> {idea.relatedIds.length}</span> : null}</div>
    </button>
  )
}

function ConstellationView({ ideas, onOpen }: { ideas: IdeaCard[]; onOpen: (idea: IdeaCard) => void }) {
  const [active, setActive] = useState(topicClusters[0].name)
  const matching = ideas.filter(idea => active === 'AI 思想库' ? idea.tags.includes('AI') : idea.title.includes(active.slice(0, 2)) || idea.summary.includes(active.slice(0, 2)))
  return (
    <div className="view constellation-view">
      <PageHeader eyebrow="EMERGENT TOPICS" title="思想脉络" subtitle="这些主题不是你建立的文件夹，而是从持续表达中自然长出来的。" action={<span className="filter-button"><Compass size={16} /> 最近 90 天</span>} />
      <section className="constellation-stage">
        <svg className="connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M49,43 C35,35 29,31 20,27" /><path d="M49,43 C63,35 69,31 77,25" /><path d="M49,43 C66,53 72,62 78,70" /><path d="M49,43 C37,54 30,66 24,74" />
        </svg>
        <div className="constellation-caption"><span><Sparkles size={13} /> AI 发现了 5 个持续生长的主题</span><p>圆越大，近期相关表达越多</p></div>
        {topicClusters.map(topic => <button key={topic.name} className={`topic-node node-${topic.color} ${active === topic.name ? 'active' : ''}`} style={{ left: `${topic.x}%`, top: `${topic.y}%`, width: topic.size, height: topic.size }} onClick={() => setActive(topic.name)}><strong>{topic.name}</strong><span>{topic.count} 条</span><em>{topic.growth}</em></button>)}
      </section>
      <section className="cluster-detail">
        <div className="section-title"><div><span className="eyebrow">SELECTED CLUSTER</span><h2>{active}</h2></div><span className="ai-badge"><WandSparkles size={13} /> AI 动态主题</span></div>
        <p className="cluster-description">你最近反复提到“记录之后的价值”和“让内容重新回到眼前”。这可能是一个值得持续验证的产品母题。</p>
        <div className="cluster-items">{(matching.length ? matching : ideas.slice(0, 3)).slice(0, 3).map(idea => <button key={idea.id} onClick={() => onOpen(idea)}><i className={`space-dot ${idea.color}`} /><span><strong>{idea.title}</strong><small>{idea.summary}</small></span><ChevronRight size={17} /></button>)}</div>
      </section>
    </div>
  )
}

function ProfileView({ session, ideas, cloud, dark, onToggleTheme, onSignOut }: { session: UserSession; ideas: IdeaCard[]; cloud: boolean; dark: boolean; onToggleTheme: () => void; onSignOut: () => void }) {
  return (
    <div className="view profile-view">
      <PageHeader eyebrow="YOUR SPACE" title="我的浮想" subtitle="管理空间、隐私与 AI 连接。" />
      <section className="profile-hero">
        <span className="avatar avatar-large">{session.name.slice(0, 1).toUpperCase()}</span>
        <div><h2>{session.name}</h2><p>{session.email}</p><span className={`status-pill ${cloud ? 'online' : ''}`}><i />{cloud ? '云端同步已连接' : '本地体验模式'}</span></div>
        <span className="status-pill online"><i />v1.0.3</span>
      </section>
      <section className="stat-strip"><div><strong>{ideas.length}</strong><span>思想卡片</span></div><div><strong>{new Set(ideas.flatMap(idea => idea.tags)).size}</strong><span>自然主题</span></div><div><strong>{ideas.reduce((sum, idea) => sum + (idea.relatedIds?.length ?? 0), 0)}</strong><span>内容连接</span></div><div><strong>5</strong><span>连续记录天数</span></div></section>
      <section className="settings-grid">
        <div className="settings-card">
          <div className="settings-heading"><span><Brain size={18} /></span><div><h3>AI 引擎</h3><p>负责转录、整理与发现关联</p></div></div>
          <div className="setting-row"><span><strong>文本整理</strong><small>Kimi K2.6 · 硅基流动</small></span><em className="status-pill"><i />代码已准备</em></div>
          <div className="setting-row"><span><strong>语音转录</strong><small>SenseVoice · 硅基流动</small></span><em className="status-pill"><i />代码已准备</em></div>
          <div className="setting-row"><span><strong>服务状态</strong><small>部署后填写 AI_API_KEY</small></span><em className="status-pill"><i />等待密钥</em></div>
        </div>
        <div className="settings-card">
          <div className="settings-heading"><span><Settings size={18} /></span><div><h3>使用偏好</h3><p>让空间更像你自己的房间</p></div></div>
          <button className="setting-row interactive" onClick={onToggleTheme}><span><strong>外观</strong><small>{dark ? '深夜模式' : '日间模式'}</small></span><span className="setting-icon">{dark ? <Moon size={17} /> : <Sun size={17} />}</span></button>
          <div className="setting-row"><span><strong>提醒与浮现</strong><small>计划在 v1.1 接入</small></span><em className="status-pill"><i />即将开放</em></div>
          <div className="setting-row"><span><strong>数据与隐私</strong><small>{cloud ? 'RLS 隔离 · 支持单条删除' : '当前仅保存在本机浏览器'}</small></span><em className={`status-pill ${cloud ? 'online' : ''}`}><i />{cloud ? '云端隔离' : '本机保存'}</em></div>
        </div>
      </section>
      <button className="signout-button" onClick={onSignOut}><LogOut size={17} /> 退出当前空间</button>
    </div>
  )
}

function IdeaDrawer({ idea, ideas, onClose, onDelete, onOpen }: { idea: IdeaCard; ideas: IdeaCard[]; onClose: () => void; onDelete: () => void; onOpen: (idea: IdeaCard) => void }) {
  const related = ideas.filter(item => idea.relatedIds?.includes(item.id))
  return (
    <div className="drawer-layer">
      <button className="drawer-backdrop" aria-label="关闭详情" onClick={onClose} />
      <aside className="idea-drawer">
        <div className="drawer-toolbar"><button className="icon-button" onClick={onClose} aria-label="关闭详情"><X size={18} /></button><span className="soft-label">思想详情</span></div>
        <div className="drawer-content">
          <div className="drawer-meta"><span className={`type-token ${idea.color}`}>{TYPE_LABELS[idea.type]}</span><span><i className={`stage-dot ${idea.stage}`} />{STAGE_LABELS[idea.stage]}</span></div>
          <h2>{idea.title}</h2>
          <p className="drawer-summary">{idea.summary}</p>
          <div className="tag-list large">{idea.tags.map(tag => <span key={tag}>#{tag}</span>)}</div>
          <div className="next-step"><span><Sparkles size={15} /> 建议的下一步</span><p>{idea.nextStep || '继续补充它，直到下一步自然出现。'}</p><span className="status-pill"><i />轻量下一步</span></div>
          <section className="raw-note"><span className="eyebrow">ORIGINAL THOUGHT</span><h3>原始表达</h3><p>{idea.raw}</p><button disabled title="录音文件保存将在 v1.1 接入"><Headphones size={15} /> 暂无原始录音</button></section>
          <section className="related-section"><span className="eyebrow">CONNECTIONS</span><h3>与它有关</h3>{related.length ? related.map(item => <button key={item.id} onClick={() => onOpen(item)}><i className={`space-dot ${item.color}`} /><span><strong>{item.title}</strong><small>{TYPE_LABELS[item.type]} · {item.space}</small></span><ArrowRight size={16} /></button>) : <p className="no-related">它还是一颗独立的种子。更多表达会让连接自然出现。</p>}</section>
          <button className="delete-button" onClick={onDelete}><Trash2 size={16} /> 删除这条记录</button>
        </div>
      </aside>
    </div>
  )
}

export default App
