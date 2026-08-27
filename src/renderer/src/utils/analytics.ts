declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export type AnalyticsConsent = 'granted' | 'denied' | 'undecided'

export type AnalyticsEventName =
  | 'tarot_language_changed'
  | 'tarot_category_selected'
  | 'tarot_question_submitted'
  | 'tarot_spread_completed'
  | 'tarot_reading_restarted'
  | 'tarot_ai_requested'
  | 'tarot_ai_completed'

const CONSENT_STORAGE_KEY = 'tarot.analytics-consent'
const DEFAULT_GA_MEASUREMENT_ID = 'G-D23SKTMEZS'
const configuredMeasurementId =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ||
  (import.meta.env.VITE_GA_ID as string | undefined) ||
  DEFAULT_GA_MEASUREMENT_ID

export function isValidMeasurementId(value: string): boolean {
  return /^G-[A-Z0-9]{6,20}$/.test(value)
}

function doNotTrackEnabled(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.doNotTrack === '1'
}

export function getAnalyticsConsent(): AnalyticsConsent {
  if (doNotTrackEnabled()) return 'denied'
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    return stored === 'granted' || stored === 'denied' ? stored : 'undecided'
  } catch {
    return 'denied'
  }
}

function persistConsent(consent: Exclude<AnalyticsConsent, 'undecided'>): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, consent)
  } catch {
    // Analytics is optional. Storage failures must never prevent the app loading.
  }
}

export function initAnalytics(): void {
  if (typeof window === 'undefined' || getAnalyticsConsent() !== 'granted') return

  const measurementId = configuredMeasurementId.trim().toUpperCase()
  if (!isValidMeasurementId(measurementId) || window.gtag) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    window.dataLayer?.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    send_page_view: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  })

  const script = document.createElement('script')
  script.id = 'google-analytics-script'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  document.head.appendChild(script)
}

export function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, 'undecided'>): void {
  persistConsent(consent)
  if (consent === 'granted') initAnalytics()
}

export function trackEvent(
  eventName: AnalyticsEventName,
  params?: Record<string, string | number | boolean | undefined>
): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
  }
}
