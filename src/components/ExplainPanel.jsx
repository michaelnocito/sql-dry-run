import './ExplainPanel.css'

// Plain-English "what this query does + how" — surfaced once the learner has
// used every hint or answered correctly. Links out to the SQL Prep Kit's
// read-it-aloud lessons. No-ops if the question has no plainSummary.
const KIT_URL = 'https://michaelnocito.github.io/analyst-prep-kit/sql/'

export default function ExplainPanel({ question }) {
  if (!question?.plainSummary) return null
  return (
    <div className="explain-panel">
      <div className="explain-head">💡 Explain this query</div>
      <p className="explain-summary">{question.plainSummary}</p>
      <a
        className="explain-link"
        href={KIT_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        🔊 Read it aloud in the SQL Prep Kit →
      </a>
    </div>
  )
}
