import { Language, Localized } from '../types/card'

export function pick<T>(value: Localized<T>, lang: Language): T {
  return value[lang]
}

export const ui = {
  appTitle: { zh: '桌面塔罗', en: 'Desktop Tarot' },
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
  aiGenerate: { zh: '生成 AI 解读', en: 'Generate AI reading' },
  aiReady: {
    zh: '由小红书 Dots 模型提供深度解读',
    en: 'Deep reading powered by the Dots model'
  },
  aiThinking: { zh: '正在解读…', en: 'Reading the cards…' },
  aiRetry: { zh: '重试', en: 'Retry' },
  aiRateLimited: {
    zh: '请求太频繁，请稍后再试',
    en: 'Too many requests. Please try again shortly.'
  },
  aiTimeout: { zh: 'Dots 解读超时，请重试', en: 'Dots took too long. Please retry.' },
  aiUnavailable: {
    zh: 'Dots 解读暂时不可用，请稍后重试',
    en: 'Dots reading is temporarily unavailable. Please try again.'
  },
  symbolism: { zh: '牌面象征', en: 'In the image' },
  watchFor: { zh: '需要留意', en: 'Watch for' },
  save: { zh: '保存', en: 'Save' }
} satisfies Record<string, Localized<string>>
