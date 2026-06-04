import { useState } from 'react'
import './FeedbackPanel.css'

const STATUS_CONFIG = {
  correct:   { label: 'Correct',                    color: 'var(--correct)',   icon: '✓' },
  hardcoded: { label: 'Right rows, wrong technique', color: 'var(--hardcode)', icon: '~' },
  incorrect: { label: 'Needs work',                  color: 'var(--incorrect)', icon: '✗' },
  error:     { label: 'SQL error',                   color: 'var(--incorrect)', icon: '!' },
}

function detailLine(result) {
  if (result.overallStatus === 'correct') {
    const n = result.rowCount
    return `${n} row${n !== 1 ? 's' : ''} · required keywords present`
  }
  if (result.overallStatus === 'hardcoded') {
    return `Missing: ${result.missingKeywords.join(', ')}`
  }
  if (result.overallStatus === 'incorrect') {
    return `Expected ${result.expectedCount} row${result.expectedCount !== 1 ? 's' : ''}, got ${result.rowCount}`
  }
  if (result.overallStatus === 'error') {
    return result.errorMessage ?? 'Unknown error'
  }
  return ''
}

export default function FeedbackPanel({ result, question, onNext, isLast }) {
  const [showSolution, setShowSolution] = useState(false)

  const cfg = STATUS_CONFIG[result.overallStatus] ?? STATUS_CONFIG.incorrect

  return (
    <div className="feedback-panel">
      <div className="feedback-status" style={{ borderColor: cfg.color, color: cfg.color }}>
        <span className="feedback-icon">{cfg.icon}</span>
        <span>{cfg.label}</span>
        <span className="feedback-score">{detailLine(result)}</span>
      </div>

      <p className="feedback-explanation">{question.explanation}</p>

      <div className="feedback-solution">
        <button
          className="btn-ghost"
          onClick={() => setShowSolution(s => !s)}
        >
          {showSolution ? 'Hide solution' : 'Show solution'}
        </button>
        {showSolution && (
          <pre className="solution-formula">{question.solutionQuery}</pre>
        )}
      </div>

      <button className="btn-primary" onClick={onNext}>
        {isLast ? 'Back to start' : 'Next question →'}
      </button>
    </div>
  )
}
