import { SKILL_LABELS, SKILLS } from '../lib/mastery'
import './WeaknessReport.css'

const WEAK_THRESHOLD = 0.6
const PREP_KIT_BASE  = 'https://michaelnocito.github.io/analyst-prep-kit/sql/'

const SKILL_SECTION = {
  'select-filter':    'SELECT, WHERE, ORDER BY, LIMIT',
  'aggregation':      'GROUP BY, HAVING, COUNT, SUM, AVG',
  'joins':            'INNER JOIN, LEFT JOIN, self-joins',
  'subqueries':       'Scalar subqueries, IN, EXISTS, correlated',
  'window-functions': 'ROW_NUMBER, RANK, LAG/LEAD, running totals',
  'string-date':      'SUBSTR, LENGTH, TRIM, strftime, date()',
}

export default function WeaknessReport({ mastery, wrongQuestions = [] }) {
  const weakSkills = SKILLS.filter(s => {
    const m = mastery[s]
    return m !== null && m !== undefined && m < WEAK_THRESHOLD
  })
  const unstarted = SKILLS.filter(s => mastery[s] === null || mastery[s] === undefined)

  if (weakSkills.length === 0 && wrongQuestions.length === 0 && unstarted.length === 0) {
    return (
      <div className="weakness-report wr-clean">
        <span className="wr-clean-icon">✓</span>
        <p>All practiced skills are above the mastery threshold. Keep drilling to maintain them.</p>
      </div>
    )
  }

  return (
    <div className="weakness-report">
      {weakSkills.length > 0 && (
        <div className="wr-section">
          <h3 className="wr-heading">Skills below 60% — bone up here</h3>
          <ul className="wr-skill-list">
            {weakSkills.map(s => (
              <li key={s} className="wr-skill-row">
                <div className="wr-skill-info">
                  <span className="wr-skill-name">{SKILL_LABELS[s]}</span>
                  <span className="wr-skill-topic">{SKILL_SECTION[s]}</span>
                </div>
                <div className="wr-skill-right">
                  <span className="wr-pct">{Math.round((mastery[s] ?? 0) * 100)}%</span>
                  <a
                    className="wr-link"
                    href={PREP_KIT_BASE}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Study →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {wrongQuestions.length > 0 && (
        <div className="wr-section">
          <h3 className="wr-heading">These will resurface in your next drill</h3>
          <ul className="wr-wrong-list">
            {wrongQuestions.slice(0, 5).map(q => (
              <li key={q.questionId} className="wr-wrong-row">
                <span className={`badge badge-diff badge-${q.difficulty}`}>{q.difficulty}</span>
                <span className="wr-wrong-prompt">{q.prompt.slice(0, 80)}…</span>
              </li>
            ))}
            {wrongQuestions.length > 5 && (
              <li className="wr-more">+ {wrongQuestions.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      {unstarted.length > 0 && weakSkills.length === 0 && (
        <div className="wr-section">
          <h3 className="wr-heading">Not yet practiced</h3>
          <p className="wr-unstarted">
            {unstarted.map(s => SKILL_LABELS[s]).join(' · ')}
          </p>
        </div>
      )}
    </div>
  )
}
