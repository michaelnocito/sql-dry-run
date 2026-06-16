import { useState, useEffect } from 'react'
import SQLQuestionView from '../components/SQLQuestionView'
import { getTrackQuestions, TRACKS } from '../data/questionBank'
import { sortByPriority } from '../lib/sessionBuilder'
import { loadAllAttempts } from '../lib/db'
import './PracticeScreen.css'

// Industry track runner — a single ordered queue of domain-scenario questions
// (no skill/difficulty picker; the track curates the path).
export default function TrackScreen({ trackId, onBack, onAttemptLogged }) {
  const [questions, setQuestions] = useState([])
  const [qIndex, setQIndex]       = useState(0)
  const [done, setDone]           = useState(false)
  const [ready, setReady]         = useState(false)

  const meta = TRACKS.find(t => t.id === trackId)

  useEffect(() => {
    const pool = getTrackQuestions(trackId)
    loadAllAttempts()
      .then(all => { setQuestions(sortByPriority(all, pool)); setReady(true) })
      .catch(() => { setQuestions(pool); setReady(true) })
  }, [trackId])

  const handleNext = () => {
    if (qIndex < questions.length - 1) setQIndex(i => i + 1)
    else setDone(true)
  }

  if (!ready) return null

  if (done || questions.length === 0) {
    return (
      <div className="practice-done">
        <h2>{questions.length === 0 ? 'Track coming soon' : 'Track complete!'}</h2>
        {questions.length > 0 && (
          <p>You worked through all {questions.length} questions in {meta?.label ?? 'this track'}.</p>
        )}
        <div className="practice-done-actions">
          <button className="btn-primary" onClick={onBack}>Back to home</button>
        </div>
      </div>
    )
  }

  return (
    <SQLQuestionView
      key={`${trackId}-${qIndex}`}
      question={questions[qIndex]}
      questionIndex={qIndex}
      totalQuestions={questions.length}
      onNext={handleNext}
      onAttemptLogged={onAttemptLogged}
      feedbackEnabled={true}
      hintsEnabled={true}
    />
  )
}
