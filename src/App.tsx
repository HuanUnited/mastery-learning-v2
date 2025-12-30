import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { DashboardView } from './components/views/DashboardView'
import { LearningView } from './components/views/LearningView'
import { RussianView } from './components/views/RussianView'
import { GuidelinesSidebar } from './components/widgets/GuidelinesSidebar'
import { PhaseTimer } from './components/widgets/PhaseTimer'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from './components/ui/button'
import { BookOpen } from 'lucide-react'
import './App.css'

type View = 'dashboard' | 'learning' | 'russian'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

function AppContent() {
  const [view, setView] = useState<View>('dashboard')
  const [showGuidelines, setShowGuidelines] = useState(false)

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
              <div className="flex items-center gap-2 flex-1 justify-center">
                <Button
                  variant="ghost"
                  onClick={() => setView('dashboard')}
                  size="sm"
                  data-active={view === 'dashboard'}
                >
                  Dashboard
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setView('learning')}
                  size="sm"
                  data-active={view === 'learning'}
                >
                  Learning
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setView('russian')}
                  size="sm"
                  data-active={view === 'russian'}
                >
                  Russian
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setShowGuidelines(true)}
                  size="sm"
                  className="gap-1.5"
                >
                  <BookOpen className="h-4 w-4" />
                  Guidelines
                </Button>
              </div>

              {/* Theme Toggle - Right */}
              <div className="shrink-0">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {view === 'dashboard' && <DashboardView />}
        {view === 'learning' && <LearningView />}
        {view === 'russian' && <RussianView />}
      </main>

      {/* Guidelines Sidebar */}
      <GuidelinesSidebar key={showGuidelines ? 'open' : 'closed'} />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="mastery-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
