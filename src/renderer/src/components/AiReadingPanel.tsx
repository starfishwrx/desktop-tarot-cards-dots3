import { useEffect, useState } from 'react'
import { AiErrorCode, AiReadingResponse } from '../../../shared/aiReading'
import { DrawnCard } from '../types/reading'
import { CategoryDefinition } from '../types/spread'
import { useLanguage } from '../context/LanguageContext'
import { analyseSpread } from '../utils/spreadAnalysis'
import { Localized } from '../types/card'
import { trackEvent } from '../utils/analytics'
import positionLens from '../data/positionLens.json'

const lenses = positionLens as Record<string, Localized<string>>

interface AiReadingPanelProps {
  category: CategoryDefinition
  question: string
  draws: DrawnCard[]
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; text: string }
  | { status: 'error'; code: AiErrorCode | 'NETWORK_ERROR' }

export function AiReadingPanel({ category, question, draws }: AiReadingPanelProps): JSX.Element {
  const { language, t } = useLanguage()
  const [state, setState] = useState<State>({ status: 'idle' })

  useEffect(() => {
    setState({ status: 'idle' })
  }, [draws, language])

  const generate = async (): Promise<void> => {
    const startedAt = Date.now()
    setState({ status: 'loading' })
    trackEvent('ai_reading_request', {
      category_id: category.id,
      language,
      has_custom_question: Boolean(question)
    })

    try {
      const response = await fetch('/api/ai-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          question: question || (language === 'zh' ? category.nameLocalized : category.name),
          categoryName: language === 'zh' ? category.nameLocalized : category.name,
          signals: analyseSpread(draws),
          cards: draws.map((draw) => ({
            position:
              language === 'zh' ? draw.position.labelLocalized : draw.position.label,
            positionDescription: draw.position.description[language],
            positionLens: lenses[draw.position.id]?.[language] ?? '',
            name: language === 'zh' ? draw.card.nameLocalized : draw.card.name,
            arcana: draw.card.arcana,
            suit: draw.card.suit,
            element: draw.card.element,
            number: draw.card.number,
            orientation: draw.orientation,
            keywords: draw.card.keywords[draw.orientation][language],
            localMeaning: draw.card.meaning[draw.orientation][language],
            symbolism: draw.card.symbolism[language],
            watchFor: draw.card.watchFor[draw.orientation][language]
          }))
        })
      })

      const result = (await response.json()) as AiReadingResponse
      const durationMs = Date.now() - startedAt

      if (result.ok) {
        trackEvent('ai_reading_result', {
          category_id: category.id,
          language,
          status: 'success',
          duration_ms: durationMs
        })
        setState({ status: 'done', text: result.text })
      } else {
        trackEvent('ai_reading_result', {
          category_id: category.id,
          language,
          status: 'error',
          code: result.code,
          duration_ms: durationMs
        })
        setState({ status: 'error', code: result.code })
      }
    } catch {
      trackEvent('ai_reading_result', {
        category_id: category.id,
        language,
        status: 'network_error',
        duration_ms: Date.now() - startedAt
      })
      setState({ status: 'error', code: 'NETWORK_ERROR' })
    }
  }

  const errorMessage =
    state.status === 'error'
      ? state.code === 'RATE_LIMITED'
        ? t('aiRateLimited')
        : state.code === 'UPSTREAM_TIMEOUT'
          ? t('aiTimeout')
          : t('aiUnavailable')
      : ''

  return (
    <div className="ai-panel speech-bubble">
      <div className="ai-panel__head">
        <strong>{t('aiReading')}</strong>
        {state.status !== 'loading' && (
          <button className="ghost-button ghost-button--small" onClick={generate}>
            {state.status === 'done' || state.status === 'error'
              ? t('aiRetry')
              : t('aiGenerate')}
          </button>
        )}
      </div>

      {state.status === 'idle' && <p className="ai-panel__hint">{t('aiReady')}</p>}
      {state.status === 'loading' && <p className="ai-panel__hint">{t('aiThinking')}</p>}
      {state.status === 'done' && <p className="ai-panel__text">{state.text}</p>}
      {state.status === 'error' && <p className="ai-panel__error">{errorMessage}</p>}
    </div>
  )
}
