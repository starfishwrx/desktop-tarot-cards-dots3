import { ReadingProvider, useReading } from './context/ReadingContext'
import { LanguageProvider } from './context/LanguageContext'
import { LanguageToggle } from './components/LanguageToggle'
import { CategoryPicker } from './components/CategoryPicker'
import { QuestionInput } from './components/QuestionInput'
import { DeckScreen } from './components/DeckScreen'
import { RevealScreen } from './components/RevealScreen'

function Screens(): JSX.Element {
  const { phase } = useReading()

  if (phase === 'category-select') return <CategoryPicker />
  if (phase === 'question-input') return <QuestionInput />
  if (phase === 'card-picking') return <DeckScreen />
  return <RevealScreen />
}

function Shell(): JSX.Element {
  return (
    <div className="app-shell">
      <div className="top-bar">
        <LanguageToggle />
      </div>
      <Screens />
    </div>
  )
}

function App(): JSX.Element {
  return (
    <LanguageProvider>
      <ReadingProvider>
        <Shell />
      </ReadingProvider>
    </LanguageProvider>
  )
}

export default App
