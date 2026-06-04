import { useState, useEffect, useMemo } from 'react'
import SQLQuestionView from '../components/SQLQuestionView'
import WeaknessReport from '../components/WeaknessReport'
import { buildSession } from '../lib/sessionBuilder'
import { getAllQuestions } from '../data/questionBank'
import { loadAllAttempts } from '../lib/db'
import { computeAllMastery } from '../lib/mastery'
import './QuickDrillScreen.css'

const SESSION_SIZE = 8

export default function QuickDrillScreen({ onBack, onAttemptLogged }) {
  const [phase, setPhase]       = useState('loading')
  const [attempts, setAttempts] = useState([])
  const [session, setSession]   = useState(null)
  const [qIndex, setQIndex]     = useState(0)
  const [results, setResults]   = useState([])

  useEffect(() => {
    loadAllAttempts().then(all => {
      setAttempts(all)
      const s = buildSession(all, getAllQuestions(), SESSION_SIZE)
      setSession(s)
      setPhase('preview')
    }).catch(() => setPhase('preview'))
  }, [])

  const mastery = useMemo(() => computeAllMastery(attempts), [attempts])

  const handleNext = () => {
    if (qIndex < session.questions.length - 1) setQIndex(i => i + 1)
    else setPhase('done')
  }

  const handleGraded = (gradeResult) => {
    const q = session.questions[qIndex]
    setResults(prev => [...prev, { question: q, gradeResult }])
  }

  if (phase === 'loading') {
    return <div className="qd-loading">Building your drill…</div>
  }

  const { preview } = session

  if (phase === 'preview') {
    if (preview.total === 0) {
      return (
        <div className="qd-screen qd-empty">
          <button className="btn-back" onClick={onBack}>← Back</button>
          <div className="qd-empty-card">
            <h2>No questions available</h2>
            <p>All questions are either cooling off or you've completed the full bank. Check back in 48 hours, or try Practice mode to drill a specific skill.</p>
            <button className="btn-ghost" onClick={onBack}>Back to home</button>
          </div>
        </div>
      )
    }
    return (
      <div className="qd-screen qd-preview">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div className="qd-preview-card">
          <h2>Your drill</h2>
          <div className="qd-breakdown">
            {preview.wrong > 0 && (
              <div className="qd-breakdown-row qd-wrong">
                <span className="qd-count">{preview.wrong}</span>
                <div className="qd-label">
                  <strong>From last session</strong>
                  <span>Questions you got wrong — back to prove them</span>
                </div>
              </div>
            )}
            {preview.fresh > 0 && (
              <div className="qd-breakdown-row qd-fresh">
                <span className="qd-count">{preview.fresh}</span>
                <div className="qd-label">
                  <strong>New questions</strong>
                  <span>Unseen — builds your coverage</span>
                </div>
              </div>
            )}
            {preview.reinforcement > 0 && (
              <div className="qd-breakdown-row qd-reinforce">
                <span className="qd-count">{preview.reinforcement}</span>
                <div className="qd-label">
                  <strong>Reinforcement</strong>
                  <span>Old correct answers — confirming it wasn't a fluke</span>
                </div>
              </div>
            )}
          </div>
          <button className="btn-primary" onClick={() => setPhase('drilling')}>
            Begin {preview.total} questions →
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'drilling') {
    return (
      <SQLQuestionView
        key={`qd-${qIndex}`}
        question={session.questions[qIndex]}
        questionIndex={qIndex}
        totalQuestions={session.questions.length}
        onNext={handleNext}
        onGraded={handleGraded}
        onAttemptLogged={onAttemptLogged}
        feedbackEnabled={true}
        hintsEnabled={true}
      />
    )
  }

  // Done
  const wrongQuestions = results
    .filter(r => r.gradeResult.overallStatus !== 'correct')
    .map(r => r.question)
  const correct = results.filter(r => r.gradeResult.overallStatus === 'correct').length

  return (
    <div className="qd-screen qd-done">
      <div className="qd-done-header">
        <h2>Drill complete</h2>
        <span className="qd-done-score">{correct}/{results.length} correct</span>
      </div>
      <WeaknessReport mastery={mastery} wrongQuestions={wrongQuestions} />
      <div className="qd-done-actions">
        <button className="btn-primary" onClick={() => {
          loadAllAttempts().then(all => {
            setAttempts(all)
            const s = buildSession(all, getAllQuestions(), SESSION_SIZE)
            setSession(s); setQIndex(0); setResults([]); setPhase('preview')
          })
        }}>
          Next drill →
        </button>
        <button className="btn-ghost" onClick={onBack}>Back to home</button>
      </div>
    </div>
  )
}
