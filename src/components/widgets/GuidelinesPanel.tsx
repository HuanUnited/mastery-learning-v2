import { useState } from 'react'
import { Pin, PinOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import '../views/GuidelinesView.css'

export function GuidelinesPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  return (
    <>
      {/* Hover Trigger Area */}
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 w-8 h-32 z-40 cursor-pointer"
        onMouseEnter={() => !isPinned && setIsOpen(true)}
      >
        <div className="absolute inset-y-0 right-0 w-1 bg-primary/50 rounded-l-full hover:w-2 transition-all" />
      </div>

      {/* Sliding Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[600px] bg-background border-l shadow-2xl z-50 transition-transform duration-300 ${
          isOpen || isPinned ? 'translate-x-0' : 'translate-x-full'
        }`}
        onMouseLeave={() => !isPinned && setIsOpen(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <h2 className="text-lg font-bold">Guidelines</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Unpin' : 'Pin open'}
            >
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false)
                setIsPinned(false)
              }}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="h-[calc(100%-4rem)] overflow-y-auto p-6">
          <div className="guideline-shell-compact">
            <div className="badge-row mb-4">
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
                  English Mastery
                </h2>
                <p className="lead">
                  All reasoning happens in English first. Build clean mental models.
                </p>

                <div className="step">
                  <h3>Step 1.1 — Analyze (3 × 10 min)</h3>
                  <div className="subsection">
                    <h4>Core Questions:</h4>
                    <ul>
                      <li>What are the core concepts?</li>
                      <li>From where to where does this take us?</li>
                      <li>How does it accomplish that journey?</li>
                      <li>How do previous concepts plug in?</li>
                    </ul>
                  </div>
                  <div className="time-pill">⏱ 3 × 10-min skims + 5-min revision each</div>
                </div>

                <div className="step">
                  <h3>Step 1.2 — Multiple Angles</h3>
                  <div className="subsection">
                    <h4>Different Perspectives:</h4>
                    <ul>
                      <li>Use LLMs for alternative explanations</li>
                      <li>Verify against original material + sources</li>
                      <li>Re-answer core questions from each angle</li>
                    </ul>
                  </div>
                  <div className="checkpoint">
                    <strong>Checkpoint:</strong> Draft 3–5 problems, solve with annotations (10–15 min each).
                    Only proceed when you can explain cleanly in English.
                  </div>
                </div>

                <div className="step">
                  <h3>Step 2.1 — Start Error Log</h3>
                  <ul>
                    <li>After each session, list mistakes with LLM</li>
                    <li>Log in Error Log tab</li>
                    <li>Export to JSON periodically</li>
                  </ul>
                </div>

                <div className="step">
                  <h3>Step 2.2 — English Drilling</h3>
                  <div className="subsection">
                    <h4>Generate Variations:</h4>
                    <ul>
                      <li>Collect ≈50 problem variations per topic</li>
                      <li>Master 5 simplest first</li>
                      <li>Target: ≤2 attempts average in latest batch</li>
                    </ul>
                  </div>
                  <div className="subsection">
                    <h4>Solving Protocol:</h4>
                    <ul>
                      <li>Attempt 1: resources OK, 5–10 min, annotate</li>
                      <li>Attempts 2–5: no resources, same time</li>
                      <li>If unsolved after 3–5, step back to easier</li>
                      <li>Always log with errors, resolution, commentary</li>
                    </ul>
                  </div>
                </div>

                <div className="step">
                  <h3>Phase 3 — Stress Testing</h3>
                  <div className="subsection">
                    <h4>Mixed Sets:</h4>
                    <ul>
                      <li>Generate mixed sets (5–10 problems)</li>
                      <li>Same 3–5 attempt rule</li>
                      <li>Resources only on attempt 1</li>
                    </ul>
                  </div>
                  <div className="subsection">
                    <h4>Deep Reviews:</h4>
                    <ul>
                      <li>Trigger if ≥1/3 unsolved or avg &gt; 2.5 attempts</li>
                      <li>Revisit Error Log, re-solve, refine</li>
                    </ul>
                  </div>
                  <div className="subsection">
                    <h4>Spaced Review:</h4>
                    <ul>
                      <li>2–4–8–16 week schedule for old errors</li>
                      <li>Write posts, videos, mentor others</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="phase">
                <h2>
                  <span className="phase-number">2</span>
                  Russian Encoding
                </h2>
                <p className="lead">
                  Only after English mastery, encode into Russian as a language layer.
                </p>

                <div className="step">
                  <h3>Step 4.1 — Prepare Materials</h3>
                  <ul>
                    <li>Translate core explanations to Russian with LLM</li>
                    <li>Build small keyword list per topic</li>
                    <li>Use list as main resource during recitation</li>
                  </ul>
                </div>

                <div className="step">
                  <h3>Step 4.2 — Explanation Drills</h3>
                  <div className="subsection">
                    <h4>Protocol:</h4>
                    <ul>
                      <li>Attempt Russian explanation using keyword list</li>
                      <li>5–10 extra minutes beyond English time</li>
                      <li>Focus on terminology, not discovering logic</li>
                    </ul>
                  </div>
                  <div className="goal-box">
                    <strong>Goal:</strong> Reconstruct English explanation in Russian using mostly
                    keywords, with logical structure automatic.
                  </div>
                </div>

                <div className="step">
                  <h3>Step 4.3 — Maintenance</h3>
                  <ul>
                    <li>Spaced schedule parallel to English reviews</li>
                    <li>Update keyword lists as better phrases appear</li>
                    <li>Optional bilingual drills: English → Russian</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop when pinned */}
      {isPinned && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => {
            setIsPinned(false)
            setIsOpen(false)
          }}
        />
      )}
    </>
  )
}
