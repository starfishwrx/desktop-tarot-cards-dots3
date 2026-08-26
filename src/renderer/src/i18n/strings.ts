import { Language, Localized } from '../types/card'

export function pick<T>(value: Localized<T>, lang: Language): T {
  return value[lang]
}

export const ui = {
  appTitle: { zh: '海星塔罗', en: 'Starfish Tarot' },
  categorySubtitle: { zh: '今天想为哪件事求一个指引？', en: 'What would you like guidance on today?' },
  pickInstruction: { zh: '凭直觉选出 3 张牌', en: 'Pick 3 cards by intuition' },
  yourSpread: { zh: '你的牌阵', en: 'Your Spread' },
  overallReading: { zh: '综合解读', en: 'Overall Reading' },
  restart: { zh: '重新占卜', en: 'Read Again' },
  upright: { zh: '正位', en: 'Upright' },
  reversed: { zh: '逆位', en: 'Reversed' },
  questionTitle: { zh: '你想问什么？', en: 'What do you want to ask?' },
  questionHint: {
    zh: '写下心里真正想问的事，然后凭直觉抽三张牌',
    en: 'Write down what’s really on your mind, then draw three cards'
  },
  questionPlaceholder: {
    zh: '例如：我该接受这个新机会吗？',
    en: 'e.g. Should I take this new opportunity?'
  },
  startDraw: { zh: '开始抽牌', en: 'Start Drawing' },
  back: { zh: '返回', en: 'Back' },
  yourQuestion: { zh: '你的问题', en: 'Your question' },
  aiReading: { zh: 'AI 深度解读', en: 'AI Reading' },
  aiGenerate: { zh: '请 Dots 解读', en: 'Ask Dots to read' },
  aiThinking: { zh: '正在解读…', en: 'Reading the cards…' },
  aiRetry: { zh: '重试', en: 'Retry' },
  aiReady: {
    zh: '由小红书 Dots 根据你的问题与完整牌阵生成解读。',
    en: 'Dots reads your question and the full spread together.'
  },
  aiUnavailable: {
    zh: 'AI 暂时不可用，请稍后重试。',
    en: 'AI is temporarily unavailable. Please try again.'
  },
  aiFailed: { zh: 'AI 解读失败', en: 'AI reading failed' },
  symbolism: { zh: '牌面象征', en: 'In the image' },
  watchFor: { zh: '需要留意', en: 'Watch for' },
  close: { zh: '关闭', en: 'Close' }
} satisfies Record<string, Localized<string>>
