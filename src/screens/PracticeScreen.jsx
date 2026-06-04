import { useState, useEffect } from 'react'
import SQLQuestionView from '../components/SQLQuestionView'
import WeaknessReport from '../components/WeaknessReport'
import { SKILLS, SKILL_LABELS, computeAllMastery } from '../lib/mastery'
import { getQuestions, getAvailableDifficulties } from '../data/questionBank'
import { sortByPriority } from '../lib/sessionBuilder'
import { loadAllAttempts } from '../lib/db'
import './PracticeScreen.css'

const DIFF_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

export default function PracticeScreen({ onBack, onAttemptLogged, initialSkill }) {
  const [mastery, setMastery]     = useState({})
  const [skill, setSkill]         = useState(initialSkill ?? null)
  const [difficulty, setDiff]     = useState(null)
  const [qIndex, setQIndex]       = useState(0)
  const [questions, setQuestions] = useState([])
  const [done, setDone]           = useState(false)

  useEffect(() => {
    loadAllAttempts()
      .then(a => setMastery(computeAllMastery(a)))
      .catch(() => {})
  }, [])

  const startQueue = (s, d) => {
    loadAllAttempts().then(all => {
      const qs = sortByPriority(all, getQuestions(s, d))
      setSkill(s); setDiff(d); setQuestions(qs); setQIndex(0); setDone(false)
    }).catch(() => {
      setSkill(s); setDiff(d)
      setQuestions(getQuestions(s, d)); setQIndex(0); setDone(false)
    })
  }

  const handleNext = () => {
    if (qIndex < questions.length - 1) setQIndex(i => i + 1)
    else setDone(true)
  }

  const handleAttemptLogged = () => {
    onAttemptLogged?.()
    loadAllAttempts().then(a => setMastery(computeAllMastery(a))).catch(() => {})
  }

  if (!skill) {
    return (
      <div className="practice-screen">
        <div className="practice-header">
          <button className="btn-back" onClick={onBack}>← Back</button>
          <h2>Practice — choose a skill</h2>
        </div>
        <div className="skill-grid">
          {SKILLS.map(s => {
            const m    = mastery[s]
            const diffs = getAvailableDifficulties(s)
            return (
              <div key={s} className="skill-card">
                <div className="skill-card-top">
                  <span className="skill-name">{SKILL_LABELS[s]}</span>
                  {m !== null && m !== undefined && (
                    <span className="skill-mastery">{Math.round(m * 100)}%</span>
                  )}
                </div>
                {m !== null && m !== undefined && (
                  <div className="mastery-bar">
                    <div className="mastery-fill" style={{ width: `${Math.round(m * 100)}%` }} />
                  </div>
                )}
                <div className="diff-buttons">
                  {['easy', 'medium', 'hard'].map(d => (
                    <button
                      key={d}
                      className={`btn-diff btn-diff-${d} ${diffs.includes(d) ? '' : 'btn-diff-locked'}`}
                      disabled={!diffs.includes(d)}
                      onClick={() => startQueue(s, d)}
                    >
                      {DIFF_LABELS[d]}
                      {!diffs.includes(d) && <span className="lock-icon"> 🔒</span>}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="practice-done">
        <h2>Nice work!</h2>
        <p>You finished all {questions.length} {DIFF_LABELS[difficulty].toLowerCase()} questions for {SKILL_LABELS[skill]}.</p>
        <WeaknessReport mastery={mastery} wrongQuestions={[]} />
        <div className="practice-done-actions">
          <button className="btn-primary" onClick={() => { setSkill(null); setDiff(null) }}>
            Practice another skill
          </button>
          <button className="btn-ghost" onClick={onBack}>Back to home</button>
        </div>
      </div>
    )
  }

  return (
    <SQLQuestionView
      key={`${skill}-${difficulty}-${qIndex}`}
      question={questions[qIndex]}
      questionIndex={qIndex}
      totalQuestions={questions.length}
      onNext={handleNext}
      onAttemptLogged={handleAttemptLogged}
      feedbackEnabled={true}
      hintsEnabled={true}
    />
  )
}
