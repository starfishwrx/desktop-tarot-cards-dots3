import major from '../../src/renderer/src/data/cards/major.json'
import wands from '../../src/renderer/src/data/cards/wands.json'
import cups from '../../src/renderer/src/data/cards/cups.json'
import swords from '../../src/renderer/src/data/cards/swords.json'
import pentacles from '../../src/renderer/src/data/cards/pentacles.json'
import spreads from '../../src/renderer/src/data/spreads.json'
import positionLens from '../../src/renderer/src/data/positionLens.json'
import type { CardMeaning, Language, Orientation } from '../../src/renderer/src/types/card'
import type { CategoryDefinition } from '../../src/renderer/src/types/spread'

const deck = [...major, ...wands, ...cups, ...swords, ...pentacles] as CardMeaning[]
const cardsById = new Map(deck.map((card) => [card.id, card]))
const categoriesById = new Map<string, CategoryDefinition>(
  (spreads as unknown as CategoryDefinition[]).map((category) => [category.id, category])
)
const lenses = positionLens as Record<string, Record<Language, string>>

export interface ReadingCardInput {
  id: string
  orientation: Orientation
}

export interface ReadingRequestInput {
  language: Language
  categoryId: string
  question: string
  cards: ReadingCardInput[]
}

export interface PreparedReading {
  language: Language
  question: string
  category: CategoryDefinition
  cards: Array<{ card: CardMeaning; orientation: Orientation }>
}

export class InputError extends Error {}

const SYSTEM = `You are an experienced tarot reader giving a three-card reading. Read the spread as one connected statement, not as three dictionary definitions.

First notice the spread's structure: Major Arcana count, dominant suit or element, reversals, and repeated numbers. Then read each card through its position. Finally read the cards against one another and land on something the querent can use this week.

Be direct, warm and unhurried. Symbolism serves the reading; do not lecture. No mystical filler, flattery, markdown, headings, bullets or card-by-card labels.

Tarot describes patterns and choices, never fixed outcomes. Do not predict medical, legal or financial results. If a professional matters, say so plainly in one short clause and continue with the reflective reading.`

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseReadingRequest(value: unknown): PreparedReading {
  if (!isRecord(value)) throw new InputError('请求格式不正确。')

  const language = value.language
  if (language !== 'zh' && language !== 'en') throw new InputError('不支持的语言。')

  const category =
    typeof value.categoryId === 'string' ? categoriesById.get(value.categoryId) : undefined
  if (!category) throw new InputError('牌阵不存在。')

  if (!Array.isArray(value.cards) || value.cards.length !== 3) {
    throw new InputError('一次解读必须包含三张牌。')
  }

  const seen = new Set<string>()
  const cards = value.cards.map((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string') {
      throw new InputError('卡牌格式不正确。')
    }
    if (entry.orientation !== 'upright' && entry.orientation !== 'reversed') {
      throw new InputError('卡牌正逆位不正确。')
    }
    const card = cardsById.get(entry.id)
    if (!card) throw new InputError('包含未知卡牌。')
    if (seen.has(entry.id)) throw new InputError('三张牌不能重复。')
    seen.add(entry.id)
    return { card, orientation: entry.orientation as Orientation }
  })

  const rawQuestion = typeof value.question === 'string' ? value.question.trim() : ''
  if (rawQuestion.length > 300) throw new InputError('问题不能超过 300 个字符。')
  if (category.id === 'custom' && !rawQuestion) throw new InputError('请先写下你的问题。')

  const question = rawQuestion || (language === 'zh' ? category.nameLocalized : category.name)
  return { language, category, question, cards }
}

function describeSignals(reading: PreparedReading): string {
  const majorCount = reading.cards.filter(({ card }) => card.arcana === 'major').length
  const reversedCount = reading.cards.filter(({ orientation }) => orientation === 'reversed').length
  const suitCounts = new Map<string, number>()
  const elementCounts = new Map<string, number>()
  const numberCounts = new Map<number, number>()

  for (const { card } of reading.cards) {
    if (card.suit) suitCounts.set(card.suit, (suitCounts.get(card.suit) ?? 0) + 1)
    if (card.element) elementCounts.set(card.element, (elementCounts.get(card.element) ?? 0) + 1)
    numberCounts.set(card.number, (numberCounts.get(card.number) ?? 0) + 1)
  }

  const dominant = (counts: Map<string, number>): string => {
    const item = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
    return item && item[1] >= 2 ? item[0] : 'none'
  }
  const repeatedNumbers = [...numberCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([number]) => number)

  return [
    `Major Arcana: ${majorCount} of 3`,
    `Reversed: ${reversedCount} of 3`,
    `Dominant suit: ${dominant(suitCounts)}`,
    `Dominant element: ${dominant(elementCounts)}`,
    `Repeated numbers: ${repeatedNumbers.length ? repeatedNumbers.join(', ') : 'none'}`
  ].join('\n')
}

function describeCard(reading: PreparedReading, index: number): string {
  const { card, orientation } = reading.cards[index]
  const position = reading.category.positions[index]
  const language = reading.language
  const cardName = language === 'zh' ? card.nameLocalized : card.name
  const positionName = language === 'zh' ? position.labelLocalized : position.label

  return [
    `${positionName} — ${cardName} (${orientation})`,
    `Position meaning: ${position.description[language]}`,
    `Position lens: ${lenses[position.id]?.[language] ?? ''}`,
    `Arcana: ${card.arcana}${card.suit ? `, suit ${card.suit}` : ''}${card.element ? `, element ${card.element}` : ''}, number ${card.number}`,
    `Stock meaning: ${card.meaning[orientation][language]}`,
    `Imagery: ${card.symbolism[language]}`,
    `Caution: ${card.watchFor[orientation][language]}`,
    `Keywords: ${card.keywords[orientation][language].join(', ')}`
  ].join('\n')
}

export function buildDotsPayload(reading: PreparedReading): Record<string, unknown> {
  const languageInstruction =
    reading.language === 'zh'
      ? '请用简体中文写 200–260 字的连续解读。'
      : 'Write 200–260 words in English.'
  const categoryName =
    reading.language === 'zh' ? reading.category.nameLocalized : reading.category.name

  const userMessage = `${languageInstruction}

Spread: ${categoryName}
Question: "${reading.question}"

Structure:
${describeSignals(reading)}

Cards in position order:

${reading.cards.map((_, index) => describeCard(reading, index)).join('\n\n')}`

  return {
    model: 'dots3-note-prev',
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: userMessage }
    ],
    stream: false,
    max_tokens: 1024,
    chat_template_kwargs: { enable_thinking: false }
  }
}

export function extractDotsText(value: unknown): string | null {
  if (!isRecord(value) || !Array.isArray(value.choices)) return null
  const first = value.choices[0]
  if (!isRecord(first) || !isRecord(first.message)) return null
  const content = first.message.content
  return typeof content === 'string' && content.trim() ? content.trim() : null
}
