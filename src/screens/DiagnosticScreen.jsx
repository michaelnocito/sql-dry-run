import { useState } from 'react'
import SQLQuestionView from '../components/SQLQuestionView'
import WeaknessReport from '../components/WeaknessReport'
import { getDiagnosticSet } from '../data/questionBank'
import { SKILL_LABELS, computeAllMastery } from '../lib/mastery'
import { loadAllAttempts } from '../lib/db'
import './DiagnosticScreen.css'

const QUESTIONS = getDiagnosticSet()

export default function DiagnosticScreen({ onBack, onAttemptLogged, onStartPractice }) {
  const [phase, setPhase]             = useState('intro')
  const [qIndex, setQIndex]           = useState(0)
  const [results, setResults]         = useState([])
  const [allAttempts, setAllAttempts] = useState([])

  const handleGraded = (gradeResult) => {
    setResults(prev => [...prev, { question: QUESTIONS[qIndex], gradeResult }])
  }

  const handleNext = () => {
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(i => i + 1)
    } else {
      loadAllAttempts().then(setAllAttempts).catch(() => {})
      setPhase('results')
    }
  }

  if (phase === 'intro') {
    return (
      <div className="diag-screen diag-intro">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div className="diag-intro-card">
          <h2>Diagnostic</h2>
          <p>
            {QUESTIONS.length} questions — one per skill. No feedback during the test.
            When you finish we'll show you exactly where to start practicing.
          </p>
          <ul className="diag-skill-list">
            {QUESTIONS.map(q => (
              <li key={q.questionId}>{SKILL_LABELS[q.skill]}</li>
            ))}
          </ul>
          <button className="btn-primary" onClick={() => setPhase('testing')}>
            Begin diagnostic →
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'testing') {
    return (
      <SQLQuestionView
        key={`diag-${qIndex}`}
        question={QUESTIONS[qIndex]}
        questionIndex={qIndex}
        totalQuestions={QUESTIONS.length}
        onNext={handleNext}
        onGraded={handleGraded}
        onAttemptLogged={onAttemptLogged}
        feedbackEnabled={false}
        hintsEnabled={false}
      />
    )
  }

  // Results
  const ranked = [...results].sort((a, b) => {
    const scoreA = a.gradeResult.correct / (a.gradeResult.total || 1)
    const scoreB = b.gradeResult.correct / (b.gradeResult.total || 1)
    return scoreA - scoreB
  })

  const weakest    = ranked[0]
  const masteryMap = computeAllMastery(allAttempts)
  const wrongQs    = results.filter(r => r.gradeResult.overallStatus !== 'correct').map(r => r.question)

  return (
    <div className="diag-screen diag-results">
      <h2>Diagnostic complete</h2>
      <p className="diag-results-sub">Skills ranked weakest → strongest</p>

      <div className="diag-results-list">
        {ranked.map(({ question, gradeResult }, i) => {
          const pct = Math.round((gradeResult.correct / (gradeResult.total || 1)) * 100)
          return (
            <div key={question.questionId} className={`diag-result-row ${i === 0 ? 'diag-weakest' : ''}`}>
              <span className="diag-rank">#{i + 1}</span>
              <span className="diag-result-skill">{SKILL_LABELS[question.skill]}</span>
              <div className="diag-result-bar-wrap">
                <div className="diag-result-bar" style={{ width: `${pct}%` }} />
              </div>
              <span className="diag-result-pct">{pct}%</span>
              {i === 0 && <span className="diag-start-tag">Start here</span>}
            </div>
          )
        })}
      </div>

      <WeaknessReport mastery={masteryMap} wrongQuestions={wrongQs} />

      <div className="diag-results-actions">
        {weakest && (
          <button
            className="btn-primary"
            onClick={() => onStartPractice?.(weakest.question.skill)}
          >
            Practice {SKILL_LABELS[weakest.question.skill]} →
          </button>
        )}
        <button className="btn-ghost" onClick={onBack}>Back to home</button>
      </div>
    </div>
  )
}
