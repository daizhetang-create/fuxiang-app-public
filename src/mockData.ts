import type { IdeaCard } from './types'

export const seedIdeas: IdeaCard[] = [
  {
    id: 'idea-1',
    title: '让旧想法在正确的时刻重新出现',
    summary: '笔记的价值不在于保存，而在于它是否会在未来某个有用的时刻再次回到眼前。',
    raw: '一般正常人都不会去打开自己的文件夹，再次查看过往的项目 idea。所以保存不应该是终点。',
    type: 'thinking', stage: 'growing', tags: ['记忆', '重新浮现', 'AI'], space: '浮想产品',
    createdAt: '2026-07-22T09:20:00.000Z', color: 'lime', relatedIds: ['idea-2', 'idea-4'],
    nextStep: '设计“今日浮现”的选择机制', resurfaced: true,
  },
  {
    id: 'idea-2',
    title: '语音作为思想系统的第一入口',
    summary: '把记录门槛降低到只需开口，AI 负责提炼、分类和建立连接。',
    raw: '我更愿意口喷，直接语音输入，让 AI 帮我生成笔记，而不是自己手敲。',
    type: 'idea', stage: 'building', tags: ['语音', '低门槛', 'AI'], space: '浮想产品',
    createdAt: '2026-07-21T14:10:00.000Z', color: 'violet', relatedIds: ['idea-1', 'idea-3'],
    nextStep: '让三位朋友完成第一次口述测试',
  },
  {
    id: 'idea-3',
    title: '十人以内的产品种子测试',
    summary: '先让身边的人真实使用，以低成本找到高频场景，再决定下一轮产品投入。',
    raw: '短期先自己试验，让身边的朋友去用，让他们实际体会并给建议。',
    type: 'project', stage: 'building', tags: ['内测', '创业', '验证'], space: '创业实验',
    createdAt: '2026-07-20T11:35:00.000Z', color: 'coral', relatedIds: ['idea-2'],
    nextStep: '确定首批 5 位测试者',
  },
  {
    id: 'idea-4',
    title: '动态主题，而不是越来越深的文件夹',
    summary: '用户保留主动分类权，AI 同时从内容中发现不断变化的隐性主题。',
    raw: '一般主动由用户自定义分类，但同时我也希望有一个去中心化的分类。',
    type: 'demo', stage: 'seed', tags: ['分类', '知识图谱', '主题'], space: '产品设计',
    createdAt: '2026-07-19T08:05:00.000Z', color: 'blue', relatedIds: ['idea-1'],
    nextStep: '制作动态主题交互原型',
  },
  {
    id: 'idea-5',
    title: '今天在路上想到：产品应该安静一点',
    summary: '好的思想工具不应该争抢注意力，它更像一间随时可以进入的安静房间。',
    raw: '界面要非常简单，但不是简单粗糙，而是打开后感觉很安静，很愿意说点什么。',
    type: 'journal', stage: 'seed', tags: ['审美', '专注', '体验'], space: '日常记录',
    createdAt: '2026-07-18T17:45:00.000Z', color: 'sand', relatedIds: [],
  },
]

export const topicClusters = [
  { name: 'AI 思想库', count: 18, growth: '+6', x: 49, y: 43, size: 132, color: 'violet' },
  { name: '语音入口', count: 14, growth: '+3', x: 20, y: 27, size: 96, color: 'lime' },
  { name: '重新浮现', count: 11, growth: '+4', x: 77, y: 25, size: 102, color: 'coral' },
  { name: '产品孵化', count: 9, growth: '+2', x: 78, y: 70, size: 88, color: 'blue' },
  { name: '个人记忆', count: 7, growth: '+1', x: 24, y: 74, size: 80, color: 'sand' },
]
