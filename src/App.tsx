import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AttemptFormV2 } from './components/forms/AttemptFormV2'
import { HistoryView } from './components/views/HistoryView'
import { StatsView } from './components/views/StatsView'
import { AnalyticsView } from './components/views/AnalyticsView'
import { RussianDrillView } from './components/views/RussianDrillView'
import { DictionaryView } from './components/views/DictionaryView'
import { GuidelinesView } from './components/views/GuidelinesView'
import { ReviewView } from './components/views/ReviewView'
import { ProgressView } from './components/views/ProgressView'
import { PhaseTimer } from './components/widgets/PhaseTimer'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from './components/ui/button'
import { TimerProvider } from '@/lib/TimerContext'
import './App.css'

type View = 'form' | 'history' | 'stats' | 'analytics' | 'russian' | 'dictionary' | 'guidelines' | 'review' | 'progress'

const queryClient = new QueryClient()

function AppContent() {
  const [view, setView] = useState<View>('form')

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Navbar */}
      <nav className="gradient-nav">
        <div className="gradient-nav-inner">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Phase Timer - Left */}
              <div className="shrink-0">
                <PhaseTimer />
              </div>

              {/* Navigation Buttons - Center */}
              <div className="flex items-center gap-2 flex-wrap justify-center flex-1 min-w-0 overflow-x-auto">
                <Button
                  variant="ghost"
                  onClick={() => setView('form')}
                  size="sm"
                  className="shrink-0"
                  data-active={view === 'form'}
                >
                  Log Attempt
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setView('history')}
                  size="sm"
                  className="shrink-0"
                  data-active={view === 'history'}
                >
                  History
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setView('review')}
                  size="sm"
                  className="shrink-0"
                  data-active={view === 'review'}
                >
                  Review
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setView('stats')}
                  size="sm"
                  className="shrink-0"
                  data-active={view === 'stats'}
                >
                  Stats
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setView('progress')}
                  size="sm"
                  className="shrink-0"
                  data-active={view === 'progress'}
                >
                  Progress
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setView('analytics')}
                  size="sm"
                  className="shrink-0"
                  data-active={view === 'analytics'}
                >
                  Analytics
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setView('russian')}
                  size="sm"
                  className="shrink-0"
                  data-active={view === 'russian'}
                >
                  Russian Drill
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setView('dictionary')}
                  size="sm"
                  className="shrink-0"
                  data-active={view === 'dictionary'}
                >
                  Dictionary
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setView('guidelines')}
                  size="sm"
                  className="shrink-0"
                  data-active={view === 'guidelines'}
                >
                  Guidelines
                </Button>
              </div>

              {/* Dark Mode Toggle - Right */}
              <div className="shrink-0">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {view === 'form' && <AttemptFormV2 />}
        {view === 'history' && <HistoryView />}
        {view === 'review' && <ReviewView />}
        {view === 'stats' && <StatsView />}
        {view === 'progress' && <ProgressView />}
        {view === 'analytics' && <AnalyticsView />}
        {view === 'russian' && <RussianDrillView />}
        {view === 'dictionary' && <DictionaryView />}
        {view === 'guidelines' && <GuidelinesView />}
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="mastery-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TimerProvider> {/* Wrap here */}
          <AppContent />
        </TimerProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
