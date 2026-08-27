import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import {
  AnalyticsConsent as ConsentState,
  getAnalyticsConsent,
  setAnalyticsConsent
} from '../utils/analytics'

export function AnalyticsConsent(): JSX.Element | null {
  const { t } = useLanguage()
  const [consent, setConsent] = useState<ConsentState>(getAnalyticsConsent)

  if (consent !== 'undecided') return null

  const choose = (next: Exclude<ConsentState, 'undecided'>): void => {
    setAnalyticsConsent(next)
    setConsent(next)
  }

  return (
    <aside className="analytics-consent" aria-label={t('analyticsConsentLabel')}>
      <p>{t('analyticsConsent')}</p>
      <div className="analytics-consent__actions">
        <button type="button" className="ghost-button ghost-button--small" onClick={() => choose('denied')}>
          {t('analyticsReject')}
        </button>
        <button type="button" className="analytics-consent__accept" onClick={() => choose('granted')}>
          {t('analyticsAccept')}
        </button>
      </div>
    </aside>
  )
}
