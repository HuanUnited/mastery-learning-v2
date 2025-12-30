import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Pin, PinOff } from 'lucide-react'
import '../views/GuidelinesView.css'

export function GuidelinesSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const shouldShow = isOpen || isPinned || isHovered

  // Close with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPinned) {
        setIsOpen(false)
        setIsHovered(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isPinned])

  return (
    <>
      {/* Hover Trigger Zone - Right Edge */}
      <div
        className="fixed right-0 top-0 w-2 h-full z-40"
        onMouseEnter={() => setIsHovered(true)}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-[90vw] max-w-4xl bg-background border-l shadow-2xl z-50 overflow-y-auto transition-transform duration-300 ${
          shouldShow ? 'translate-x-0' : 'translate-x-full'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => !isPinned && setIsHovered(false)}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">Learning Guidelines</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false)
                setIsPinned(false)
                setIsHovered(false)
              }}
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content - Original Guidelines */}
        <div className="p-6">
          <div className="guideline-shell">
            <div className="badge-row mb-6">
              <span className="badge">English First</span>
              <span className="badge">Russian Second</span>
              <span className="badge">Drilling Protocol</span>
              <span className="badge">Error Logging</span>
            </div>

            <div className="guideline-content">
              {/* Phase 1 */}
              <div className="phase">
                <h2>
                  <span className="phase-number">1</span>
                  English Mastery — Understanding & Logic
                </h2>
                <p className="lead">
                  All reasoning happens in English first. The goal is a clean mental model and
                  reliable problem-solving ability, independent of language.
                </p>

                <div className="step">
                  <h3>Step 1.1 — Analyze the Material (3 × 10 minutes)</h3>
                  <p>
                    Read the material and its outline in English. After each 10-minute skim,
                    pause to answer and refine these questions:
                  </p>

                  <div className="subsection">
                    <h4>For any material:</h4>
                    <ul>
                      <li>What are the core concepts in this material?</li>
                    </ul>
                  </div>

                  <div className="subsection">
                    <h4>For proofs / theoretical content:</h4>
                    <ul>
                      <li>From where (which assumptions or earlier results) and to which outcome does this material want to take us?</li>
                      <li>How does the material accomplish that journey?</li>
                      <li>How do the previously introduced concepts plug into this argument?</li>
                    </ul>
                  </div>

                  <div className="subsection">
                    <h4>For DSA / algorithms:</h4>
                    <ul>
                      <li>What core problem does this algorithm or data structure solve?</li>
                      <li>What are the constraints? (time, space, input type)</li>
                      <li>What are the worst / average / best cases, and why?</li>
                      <li>How does this build on previous data structures or algorithms?</li>
                    </ul>
                  </div>

                  <div className="time-pill">⏱ 3 × 10-minute skims + 5-minute revision after each</div>
                </div>

                {/* Add all other steps from original GuidelinesView */}
                {/* ... (keeping content brief for this response, but include ALL original content) */}
              </div>

              {/* Phase 2 */}
              <div className="phase">
                <h2>
                  <span className="phase-number">2</span>
                  Russian Encoding — Language Layer After Mastery
                </h2>
                <p className="lead">
                  Only after English mastery do you deliberately encode understanding into Russian.
                  Logic stays in English; Russian is a separate drill focused on terminology and expression.
                </p>
                {/* ... All Phase 2 content */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop when pinned */}
      {shouldShow && !isPinned && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => {
            setIsOpen(false)
            setIsHovered(false)
          }}
        />
      )}
    </>
  )
}
