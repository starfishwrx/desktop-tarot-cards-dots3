import { useEffect, useState } from 'react'
import { DrawnCard } from '../types/reading'
import { CategoryDefinition } from '../types/spread'
import { useLanguage } from '../context/LanguageContext'

interface AiReadingPanelProps {
  category: CategoryDefinition
  question: string
  draws: DrawnCard[]
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; text: string }
  | { status: 'error'; message: string }

interface ReadingResponse {
  text?: string
  error?: { message?: string }
}

export function AiReadingPanel({
  category,
  question,
  draws
}: AiReadingPanelProps): JSX.Element {
  const { language, t } = useLanguage()
  const [state, setState] = useState<State>({ status: 'idle' })

  useEffect(() => {
    setState({ status: 'idle' })
  }, [draws, language])

  const generate = async (): Promise<void> => {
    setState({ status: 'loading' })
    try {
      const response = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          categoryId: category.id,
          question,
          cards: draws.map((draw) => ({ id: draw.card.id, orientation: draw.orientation }))
        })
      })
      const result = (await response.json()) as ReadingResponse
      if (!response.ok || !result.text) {
        throw new Error(result.error?.message || t('aiUnavailable'))
      }
      setState({ status: 'done', text: result.text })
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : t('aiUnavailable')
      })
    }
  }

  return (
    <div className="ai-panel speech-bubble">
      <div className="ai-panel__head">
        <strong>{t('aiReading')} · Dots</strong>
        {state.status !== 'loading' && (
          <button className="ghost-button ghost-button--small" onClick={generate}>
            {state.status === 'done' || state.status === 'error' ? t('aiRetry') : t('aiGenerate')}
          </button>
        )}
      </div>

      {state.status === 'idle' && <p className="ai-panel__hint">{t('aiReady')}</p>}
      {state.status === 'loading' && <p className="ai-panel__hint">{t('aiThinking')}</p>}
      {state.status === 'done' && <p className="ai-panel__text">{state.text}</p>}
      {state.status === 'error' && (
        <p className="ai-panel__error">
          {t('aiFailed')}: {state.message}
        </p>
      )}
    </div>
  )
}
