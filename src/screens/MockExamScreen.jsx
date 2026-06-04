import { useState, useEffect, useRef } from 'react'
import SQLQuestionView from '../components/SQLQuestionView'
import WeaknessReport from '../components/WeaknessReport'
import { getMockExamSet } from '../data/questionBank'
import { SKILL_LABELS, computeAllMastery } from '../lib/mastery'
import { loadAllAttempts } from '../lib/db'
import './MockExamScreen.css'

const DURATIONS = [
  { label: '20 min', seconds: 20 * 60 },
  { label: '40 min', seconds: 40 * 60 },
  { label: '60 min', seconds: 60 * 60 },
]

const QUESTIONS = getMockExamSet()

function fmt(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function MockExamScreen({ onBack, onAttemptLogged }) {
  const [phase, setPhase]             = useState('setup')
  const [duration, setDuration]       = useState(null)
  const [qIndex, setQIndex]           = useState(0)
  const [timeLeft, setTimeLeft]       = useState(0)
  const [results, setResults]         = useState([])
  const [allAttempts, setAllAttempts] = useState([])
  const timerRef = useRef(null)

  const startExam = (secs) => {
    setDuration(secs); setTimeLeft(secs); setQIndex(0); setResults([]); setPhase('exam')
  }

  useEffect(() => {
    if (phase !== 'exam') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          loadAllAttempts().then(setAllAttempts).catch(() => {})
          setPhase('review')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const handleGraded = (gradeResult) => {
    setResults(prev => [...prev, { question: QUESTIONS[qIndex], gradeResult }])
  }

  const handleNext = () => {
    if (qIndex < QUESTIONS.length - 1) setQIndex(i => i + 1)
    else { clearInterval(timerRef.current); setPhase('review') }
  }

  const submitEarly = () => {
    clearInterval(timerRef.current)
    loadAllAttempts().then(setAllAttempts).catch(() => {})
    setPhase('review')
  }

  if (phase === 'setup') {
    return (
      <div className="mock-screen mock-setup">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div className="mock-setup-card">
          <h2>Mock Exam</h2>
          <p>{QUESTIONS.length} questions across all skills — mixed difficulty, skill-grouped. No hints or feedback until the end.</p>
          <div className="mock-duration-row">
            {DURATIONS.map(d => (
              <button
                key={d.label}
                className={`btn-duration ${duration?.seconds === d.seconds ? 'selected' : ''}`}
                onClick={() => setDuration(d)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <button
            className="btn-primary"
            disabled={!duration}
            onClick={() => startExam(duration.seconds)}
          >
            Start exam →
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'exam') {
    const urgent = timeLeft < 300
    return (
      <div className="mock-exam-wrapper">
        <div className={`mock-timer ${urgent ? 'mock-timer-urgent' : ''}`}>
          ⏱ {fmt(timeLeft)}
          <button className="btn-submit-early" onClick={submitEarly}>Submit exam</button>
        </div>
        <SQLQuestionView
          key={`mock-${qIndex}`}
          question={QUESTIONS[qIndex]}
          questionIndex={qIndex}
          totalQuestions={QUESTIONS.length}
          onNext={handleNext}
          onGraded={handleGraded}
          onAttemptLogged={onAttemptLogged}
          feedbackEnabled={false}
          hintsEnabled={false}
        />
      </div>
    )
  }

  // Review
  const answered   = results.length
  const correct    = results.filter(r => r.gradeResult.overallStatus === 'correct').length
  const pct        = answered ? Math.round((correct / answered) * 100) : 0
  const masteryMap = computeAllMastery(allAttempts)
  const wrongQs    = results.filter(r => r.gradeResult.overallStatus !== 'correct').map(r => r.question)

  return (
    <div className="mock-screen mock-review">
      <div className="mock-review-header">
        <h2>Exam complete</h2>
        <div className="mock-score">
          <span className="mock-score-num">{correct}/{answered}</span>
          <span className="mock-score-pct">{pct}% correct</span>
        </div>
      </div>

      <div className="mock-review-list">
        {QUESTIONS.map((q, i) => {
          const r = results[i]
          if (!r) {
            return (
              <div key={q.questionId} className="review-row review-skipped">
                <span className="review-skill">{SKILL_LABELS[q.skill]}</span>
                <span className={`badge badge-diff badge-${q.difficulty}`}>{q.difficulty}</span>
                <span className="review-status status-skipped">— Skipped</span>
              </div>
            )
          }
          const status = r.gradeResult.overallStatus
          return (
            <details key={q.questionId} className={`review-row review-${status}`}>
              <summary className="review-summary">
                <span className="review-skill">{SKILL_LABELS[q.skill]}</span>
                <span className={`badge badge-diff badge-${q.difficulty}`}>{q.difficulty}</span>
                <span className={`review-status status-${status}`}>
                  {{ correct: '✓ Correct', hardcoded: '~ Right rows, wrong technique', incorrect: '✗ Incorrect', error: '! SQL error' }[status]}
                </span>
              </summary>
              <div className="review-detail">
                <p className="review-prompt">{q.prompt}</p>
                <p className="review-explanation">{q.explanation}</p>
                <pre className="review-formula">{q.solutionQuery}</pre>
              </div>
            </details>
          )
        })}
      </div>

      <WeaknessReport mastery={masteryMap} wrongQuestions={wrongQs} />

      <div className="mock-review-actions">
        <button className="btn-primary" onClick={() => setPhase('setup')}>Take another exam</button>
        <button className="btn-ghost" onClick={onBack}>Back to home</button>
      </div>
    </div>
  )
}
