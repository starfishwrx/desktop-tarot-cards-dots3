import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Language } from '../types/card'
import { ui } from '../i18n/strings'
import { trackEvent } from '../utils/analytics'

const STORAGE_KEY = 'tarot.language'

const metadata = {
  zh: {
    lang: 'zh-CN',
    locale: 'zh_CN',
    title: '免费在线塔罗牌占卜与 AI 解读｜海星塔罗',
    description:
      '海星塔罗提供完整 78 张韦特塔罗牌、五种牌阵、正逆位牌义与小红书 Dots AI 综合解读，支持中英文，免费在线使用。'
  },
  en: {
    lang: 'en',
    locale: 'en_US',
    title: 'Free Online Tarot Cards & AI Reading | Starfish Tarot',
    description:
      'Explore all 78 Rider-Waite-Smith tarot cards, five three-card spreads, upright and reversed meanings, and an optional Dots AI reading in English or Chinese.'
  }
} satisfies Record<Language, { lang: string; locale: string; title: string; description: string }>

function updateMetadata(language: Language): void {
  const current = metadata[language]
  document.documentElement.lang = current.lang
  document.title = current.title

  const selectors = [
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]'
  ]
  for (const selector of selectors) {
    document.querySelector(selector)?.setAttribute('content', current.description)
  }
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', current.title)
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', current.locale)
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', current.title)
}

function loadInitialLanguage(): Language {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof ui) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }): JSX.Element {
  const [language, setLanguageState] = useState<Language>(loadInitialLanguage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // Language storage is optional; restricted mobile browsers may reject it.
    }
    updateMetadata(language)
  }, [language])

  const setLanguage = (lang: Language): void => {
    if (lang === language) return
    setLanguageState(lang)
    trackEvent('tarot_language_changed', { language: lang })
  }
  const t = (key: keyof typeof ui): string => ui[key][language]

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
