import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Language } from '../types/card'
import { ui } from '../i18n/strings'

const STORAGE_KEY = 'tarot.language'

function loadInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' ? 'en' : 'zh'
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
    localStorage.setItem(STORAGE_KEY, language)
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'

    const metadata =
      language === 'zh'
        ? {
            title: '免费在线塔罗牌占卜与 AI 解读｜海星塔罗',
            description:
              '海星塔罗提供完整 78 张韦特塔罗牌、五种牌阵、正逆位牌义与小红书 Dots AI 综合解读，支持中英文，免费在线使用。'
          }
        : {
            title: 'Free Online Tarot Cards & AI Reading | Starfish Tarot',
            description:
              'Explore all 78 Rider-Waite-Smith tarot cards, five three-card spreads, upright and reversed meanings, and an optional Dots AI reading in English or Chinese.'
          }

    document.title = metadata.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', metadata.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', metadata.description)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', metadata.title)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', metadata.description)
  }, [language])

  const setLanguage = (lang: Language): void => setLanguageState(lang)
  const t = (key: keyof typeof ui): string => ui[key][language]

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
