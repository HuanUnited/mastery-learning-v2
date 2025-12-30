import './GuidelinesView.css';

export const GuidelinesView = () => {
  return (
    <div className="guideline-shell">
      <div className="guideline-header">
        <div className="guideline-header-inner">
          <h1>Decoupled Mastery Learning System</h1>
          <p>
            A structured approach to mastering complex material: build logic in English first, 
            then encode it into Russian as a separate language layer.
          </p>
          <div className="badge-row">
            <span className="badge">English First</span>
            <span className="badge">Russian Second</span>
            <span className="badge">Drilling Protocol</span>
            <span className="badge">Error Logging</span>
          </div>
        </div>
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

          <div className="step">
            <h3>Step 1.2 — Multiple Angles & One-Page Synthesis</h3>
            <p>
              Attack the same English material from several explanations while keeping 
              the original source as the ground truth.
            </p>

            <div className="subsection">
              <h4>Different Angles:</h4>
              <ul>
                <li>Use LLMs to generate alternative explanations and variations.</li>
                <li>Require LLMs to verify answers against RAG over the original material plus reputable online sources.</li>
                <li>For each angle, re-answer all Step 1.1 questions.</li>
              </ul>
            </div>

            <div className="subsection">
              <h4>Active Explanation & Quizzing:</h4>
              <ul>
                <li>Read, re-read, and explain the concepts in your own English words.</li>
                <li>Have LLMs quiz you rapidly. Every question must be grounded in the original material.</li>
                <li>After 5–10 quiz attempts, write a one-page detailed explanation (or proof) entirely in English.</li>
                <li>For proofs, insist on a correct, formal version.</li>
              </ul>
            </div>

            <div className="checkpoint">
              <strong>Checkpoint:</strong> While exploring different angles, draft 3–5 problems that deepen understanding. 
              Solve each with explicit annotation (10–15 minutes per problem). Only proceed when you can explain 
              the material cleanly in English and solve these problems with clear reasoning.
            </div>

            <div className="time-pill">⏱ 15 minutes per angle to answer questions + 5 minutes to review</div>
          </div>

          <div className="step">
            <h3>Step 2.1 — Start the English Error Log</h3>
            <p>This begins Phase 2 (drilling) but is tightly coupled to your English understanding.</p>

            <div className="subsection">
              <h4>Process:</h4>
              <ul>
                <li>After each Q&A, problem-solving, or explanation session in English, use an LLM to list your mistakes and fuzzy spots.</li>
                <li>Log each error in the Error Log tab of this application.</li>
                <li>Export logs periodically to JSON for machine analysis.</li>
              </ul>
            </div>
          </div>

          <div className="step">
            <h3>Step 2.2 — English Drilling & Problem Variations</h3>
            <p>Here you push the concept to automaticity in English only.</p>

            <div className="subsection">
              <h4>Generate Variations:</h4>
              <ul>
                <li>For each topic, collect ≈50 problem variations (or more if helpful), from easy to very hard.</li>
                <li>Variations are topic-specific (e.g., "binary search" variations), not subject-wide.</li>
              </ul>
            </div>

            <div className="subsection">
              <h4>Master the Five Simplest Variations First:</h4>
              <ul>
                <li>Identify the 5 simplest problems for this topic.</li>
                <li>Master them before moving on.</li>
                <li>Use batches of up to 5 attempts per problem; track the latest batch average.</li>
                <li>Mastery target: average ≤ 2 attempts in the latest batch.</li>
              </ul>
            </div>

            <div className="subsection">
              <h4>Solving Protocol (Per Problem):</h4>
              <ul>
                <li>Attempt 1: resources allowed, max 5–10 minutes, annotation on first few problems of each type.</li>
                <li>Attempts 2–5: no resources, same time cap, commentary after each attempt.</li>
                <li>If still unsolved after 3–5 attempts, step back to a previous easier variation, solve it, then come back.</li>
                <li>Always log attempts in the Error Log with errors, resolution strategy, annotation, and commentary.</li>
              </ul>
            </div>

            <div className="subsection">
              <h4>Re-Explanation Cycles:</h4>
              <ul>
                <li>After about 1/4 of variations are solved, close notes and re-explain the topic in English (written preferred).</li>
                <li>Each re-explanation session ≈15 minutes; repeat three times in total, updating your mental model.</li>
              </ul>
            </div>

            <div className="time-note">
              <strong>Time Flexibility:</strong> Time allocated is determined by solving speed, not a fixed daily quota. 
              You may leave ≈1/7 of the variations unsolved to move on, but mark them explicitly for later return.
            </div>
          </div>

          <div className="step">
            <h3>Phase 3 — English Stress Testing & Integration</h3>
            <p>Now you mix topics and check whether the English logic actually generalizes.</p>

            <div className="subsection">
              <h4>Mixed Sets:</h4>
              <ul>
                <li>Maintain a list of all learned knowledge (problem types, theorems, proofs, algorithms).</li>
                <li>Generate or find mixed sets of 5–10 problems that require different concepts.</li>
                <li>Solve them using the same 3–5 attempt rule, with logging and limited resource use (attempt 1 only).</li>
              </ul>
            </div>

            <div className="subsection">
              <h4>Deep Reviews:</h4>
              <ul>
                <li>After 2–3 mixed sets, trigger a deep review if ≥1/3 of problems are unsolved after all attempts, or if the average attempts per problem &gt; 2.5.</li>
                <li>Deep review = revisit relevant entries in the Error Log, re-solve, and refine explanations.</li>
              </ul>
            </div>

            <div className="subsection">
              <h4>Spaced & Ongoing Review:</h4>
              <ul>
                <li>Old errors (already solved at least once) are revisited on a 2–4–8–16 week schedule.</li>
                <li>Alongside this, write blog posts, make videos, or mentor others in English on topics considered mastered.</li>
              </ul>
            </div>

            <div className="subsection">
              <h4>Time Allocation Rules (English Phases):</h4>
              <ul>
                <li>Time allocation is driven by learning and solving speed, not a fixed daily budget.</li>
                <li>If new material consumes more than ≈6 hours in a day, stop and mark it as "Learning" to revisit the next day.</li>
                <li>If revisiting or reviewing old material exceeds ≈3 hours in a day, also stop and mark for later.</li>
              </ul>
            </div>
          </div>
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

          <div className="step">
            <h3>Step 4.1 — Prepare Russian Materials</h3>

            <div className="subsection">
              <h4>Translation Setup:</h4>
              <ul>
                <li>Translate the core English explanation, definitions, and theorems into Russian with LLM help.</li>
                <li>Build a small Russian keyword list per topic (terms, phrases, connective words).</li>
                <li>Keep this list as the main resource during Russian recitation; avoid full Russian textbooks during initial attempts to reduce overload.</li>
              </ul>
            </div>
          </div>

          <div className="step">
            <h3>Step 4.2 — Russian Explanation Drills</h3>
            <p>Here you treat Russian as a speaking/writing skill that sits on top of already-mastered logic.</p>

            <div className="subsection">
              <h4>Explanation Protocol:</h4>
              <ul>
                <li>For each material, attempt a Russian explanation (written or spoken) using only: your English understanding, and the Russian keyword list for that topic.</li>
                <li>Each Russian explanation attempt gets 5–10 extra minutes beyond the English attempt time.</li>
                <li>Focus on accurate terminology and natural phrasing, not discovering new logic.</li>
              </ul>
            </div>

            <div className="subsection">
              <h4>Russian Drilling Log:</h4>
              <ul>
                <li>After each explanation or recitation, log the attempt in the Russian Drilling Log tab.</li>
                <li>Capture: Russian name, status, last reviewed date, specific phrasing errors, and how you fixed them.</li>
              </ul>
            </div>

            <div className="goal-box">
              <strong>Goal:</strong> You can reconstruct your English explanation in Russian, using mostly the keyword list 
              and minimal help, within a reasonable time window. Logical structure feels automatic; only words and phrasing 
              require attention.
            </div>
          </div>

          <div className="step">
            <h3>Step 4.3 — Russian Maintenance</h3>
            <ul>
              <li>Revisit Russian explanations on a spaced schedule (parallel to English error reviews).</li>
              <li>Update Russian keyword lists as better phrases and standard exam formulations appear.</li>
              <li>Optionally, perform short bilingual drills: state the theorem in English, then immediately restate in Russian.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
