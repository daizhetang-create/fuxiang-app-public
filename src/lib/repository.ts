import { supabase } from './supabase'
import { seedIdeas } from '../mockData'
import type { IdeaCard } from '../types'

const STORAGE_KEY = 'fuxiang_ideas_v1'

const localList = (): IdeaCard[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedIdeas))
    return seedIdeas
  }
  try { return JSON.parse(raw) as IdeaCard[] } catch { return seedIdeas }
}

export async function listIdeas(userId?: string): Promise<IdeaCard[]> {
  if (!supabase || !userId || userId === 'demo-user') return localList()
  const { data, error } = await supabase.from('ideas').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(row => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    raw: row.raw_text,
    type: row.type,
    stage: row.stage,
    tags: row.tags ?? [],
    space: row.space,
    createdAt: row.created_at,
    color: row.color,
    relatedIds: row.related_ids ?? [],
    nextStep: row.next_step,
  })) as IdeaCard[]
}

export async function saveIdea(idea: IdeaCard, userId?: string): Promise<void> {
  if (!supabase || !userId || userId === 'demo-user') {
    const ideas = [idea, ...localList().filter(item => item.id !== idea.id)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas))
    return
  }
  const { error } = await supabase.from('ideas').upsert({
    id: idea.id,
    user_id: userId,
    title: idea.title,
    summary: idea.summary,
    raw_text: idea.raw,
    type: idea.type,
    stage: idea.stage,
    tags: idea.tags,
    space: idea.space,
    color: idea.color,
    related_ids: idea.relatedIds ?? [],
    next_step: idea.nextStep,
  })
  if (error) throw error
}

export async function removeIdea(id: string, userId?: string): Promise<void> {
  if (!supabase || !userId || userId === 'demo-user') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localList().filter(item => item.id !== id)))
    return
  }
  const { error } = await supabase.from('ideas').delete().eq('id', id)
  if (error) throw error
}
