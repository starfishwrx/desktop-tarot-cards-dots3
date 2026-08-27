import { createContext, useContext, useMemo, useReducer, ReactNode } from 'react'
import { deck } from '../data/cards'
import spreadsData from '../data/spreads.json'
import { CardMeaning } from '../types/card'
import { CategoryDefinition, CategoryId } from '../types/spread'
import { DrawnCard } from '../types/reading'
import { shuffle } from '../utils/shuffle'
import { assignDraw } from '../utils/draw'
import { trackEvent } from '../utils/analytics'

const cards: CardMeaning[] = deck
const categories = spreadsData as CategoryDefinition[]

export type Phase = 'category-select' | 'question-input' | 'card-picking' | 'result'

interface ReadingState {
  phase: Phase
  category: CategoryDefinition | null
  question: string
  shuffledDeck: CardMeaning[]
  draws: DrawnCard[]
}

type Action =
  | { type: 'SELECT_CATEGORY'; categoryId: CategoryId }
  | { type: 'SUBMIT_QUESTION'; question: string }
  | { type: 'PICK_CARD'; cardId: string }
  | { type: 'RESTART' }

const initialState: ReadingState = {
  phase: 'category-select',
  category: null,
  question: '',
  shuffledDeck: [],
  draws: []
}

function reducer(state: ReadingState, action: Action): ReadingState {
  switch (action.type) {
    case 'SELECT_CATEGORY': {
      const category = categories.find((c) => c.id === action.categoryId) ?? null
      // The custom reading needs the question before the deck comes out.
      if (category?.id === 'custom') {
        return { ...initialState, phase: 'question-input', category }
      }
      return {
        ...initialState,
        phase: 'card-picking',
        category,
        shuffledDeck: shuffle(cards)
      }
    }
    case 'SUBMIT_QUESTION': {
      const question = action.question.trim()
      if (state.phase !== 'question-input' || !question) return state
      return {
        ...state,
        question,
        phase: 'card-picking',
        shuffledDeck: shuffle(cards)
      }
    }
    case 'PICK_CARD': {
      if (state.phase !== 'card-picking' || !state.category || state.draws.length >= 3) return state
      if (state.draws.some((d) => d.card.id === action.cardId)) return state

      const card = cards.find((c) => c.id === action.cardId)
      if (!card) return state

      const draws = [...state.draws, assignDraw(card, state.draws.length, state.category)]

      return {
        ...state,
        draws,
        phase: draws.length === 3 ? 'result' : 'card-picking'
      }
    }
    case 'RESTART':
      return initialState
    default:
      return state
  }
}

interface ReadingContextValue extends ReadingState {
  selectCategory: (categoryId: CategoryId) => void
  submitQuestion: (question: string) => void
  pickCard: (cardId: string) => void
  restart: () => void
  categories: CategoryDefinition[]
}

const ReadingContext = createContext<ReadingContextValue | null>(null)

export function ReadingProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)

  const value = useMemo<ReadingContextValue>(
    () => ({
      ...state,
      categories,
      selectCategory: (categoryId) => {
        if (!categories.some((category) => category.id === categoryId)) return
        dispatch({ type: 'SELECT_CATEGORY', categoryId })
        trackEvent('tarot_category_selected', { category_id: categoryId })
      },
      submitQuestion: (question) => {
        const trimmedQuestion = question.trim()
        if (state.phase !== 'question-input' || !trimmedQuestion) return
        dispatch({ type: 'SUBMIT_QUESTION', question })
        trackEvent('tarot_question_submitted', { question_length: trimmedQuestion.length })
      },
      pickCard: (cardId) => {
        const isValidPick =
          state.phase === 'card-picking' &&
          Boolean(state.category) &&
          state.draws.length < 3 &&
          !state.draws.some((draw) => draw.card.id === cardId) &&
          cards.some((card) => card.id === cardId)
        if (!isValidPick) return

        dispatch({ type: 'PICK_CARD', cardId })
        if (state.category && state.draws.length === 2) {
          trackEvent('tarot_spread_completed', {
            category_id: state.category.id,
            card_count: 3
          })
        }
      },
      restart: () => {
        if (state.phase === 'category-select') return
        dispatch({ type: 'RESTART' })
        trackEvent('tarot_reading_restarted', { previous_category_id: state.category?.id })
      }
    }),
    [state]
  )

  return <ReadingContext.Provider value={value}>{children}</ReadingContext.Provider>
}

export function useReading(): ReadingContextValue {
  const ctx = useContext(ReadingContext)
  if (!ctx) throw new Error('useReading must be used within a ReadingProvider')
  return ctx
}

