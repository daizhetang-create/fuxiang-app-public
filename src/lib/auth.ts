import { supabase } from './supabase'
import type { UserSession } from '../types'

const SESSION_KEY = 'fuxiang_session_v1'

export async function getSession(): Promise<UserSession | null> {
  if (!supabase) {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) return JSON.parse(stored) as UserSession
    if (window.location.protocol === 'file:') return enterDemo()
    return null
  }
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  return user ? {
    id: user.id,
    email: user.email ?? '',
    name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? '新朋友',
  } : null
}

export async function signIn(email: string, password: string): Promise<UserSession> {
  if (!supabase) {
    const session = { id: 'demo-user', email, name: email.split('@')[0] || '体验者', demo: true }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) throw error ?? new Error('登录失败')
  return { id: data.user.id, email: data.user.email ?? email, name: data.user.user_metadata?.name ?? email.split('@')[0] }
}

export async function signUp(name: string, email: string, password: string): Promise<UserSession> {
  if (!supabase) {
    const session = { id: 'demo-user', email, name: name || '体验者', demo: true }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  }
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
  if (error || !data.user) throw error ?? new Error('注册失败')
  return { id: data.user.id, email: data.user.email ?? email, name }
}

export function enterDemo(): UserSession {
  const session = { id: 'demo-user', email: 'hello@fuxiang.app', name: '思想体验者', demo: true }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(SESSION_KEY)
  if (supabase) await supabase.auth.signOut()
}
