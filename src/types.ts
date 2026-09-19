export type IdeaType = 'idea' | 'thinking' | 'project' | 'demo' | 'journal' | 'memory'
export type IdeaStage = 'seed' | 'growing' | 'building' | 'complete'

export interface IdeaCard {
  id: string
  title: string
  summary: string
  raw: string
  type: IdeaType
  stage: IdeaStage
  tags: string[]
  space: string
  createdAt: string
  color: 'lime' | 'violet' | 'coral' | 'blue' | 'sand'
  relatedIds?: string[]
  nextStep?: string
  resurfaced?: boolean
}

export interface UserSession {
  id: string
  name: string
  email: string
  avatar?: string
  demo?: boolean
}

export type ViewName = 'today' | 'capture' | 'library' | 'constellation' | 'profile'

export const TYPE_LABELS: Record<IdeaType, string> = {
  idea: '想法',
  thinking: '思考',
  project: '项目',
  demo: 'Demo',
  journal: '日记',
  memory: '记忆',
}

export const STAGE_LABELS: Record<IdeaStage, string> = {
  seed: '种子',
  growing: '生长中',
  building: '正在实现',
  complete: '已完成',
}
