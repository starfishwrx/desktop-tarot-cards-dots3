import { AiReadingRequest } from '../src/shared/aiReading.js'

export const readingRequest: AiReadingRequest = {
  language: 'zh',
  question: '我应该怎样面对新的工作机会？',
  categoryName: '事业',
  signals: {
    majorCount: 1,
    reversedCount: 1,
    dominantSuit: 'wands',
    dominantElement: 'fire',
    repeatedNumbers: []
  },
  cards: [
    {
      position: '过去',
      positionDescription: '塑造当前处境的背景',
      positionLens: '作为已经发生的力量来读',
      name: '魔术师',
      arcana: 'major',
      element: 'air',
      number: 1,
      orientation: 'upright',
      keywords: ['行动', '资源'],
      localMeaning: '你已经掌握了开始所需的工具。',
      symbolism: '桌上的四种元素象征可用资源。',
      watchFor: '不要把能力展示变成操控。'
    },
    {
      position: '现在',
      positionDescription: '目前最需要看见的动力',
      positionLens: '作为正在发生的张力来读',
      name: '权杖二',
      arcana: 'minor',
      suit: 'wands',
      element: 'fire',
      number: 2,
      orientation: 'reversed',
      keywords: ['犹豫', '视野'],
      localMeaning: '选择很多，但迟迟没有迈出一步。',
      symbolism: '手中的地球仪象征尚未落地的版图。',
      watchFor: '不要用继续规划替代真实试验。'
    },
    {
      position: '建议',
      positionDescription: '下一步可以采取的行动',
      positionLens: '作为具体建议来读',
      name: '权杖三',
      arcana: 'minor',
      suit: 'wands',
      element: 'fire',
      number: 3,
      orientation: 'upright',
      keywords: ['拓展', '等待反馈'],
      localMeaning: '先把一个选择送到真实世界获取反馈。',
      symbolism: '人物眺望已经出航的船只。',
      watchFor: '行动后要留出观察和修正空间。'
    }
  ]
}
