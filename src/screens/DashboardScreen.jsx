import { useMemo } from 'react'
import { SKILLS, SKILL_LABELS, computeAllMastery, getWeakestSkill } from '../lib/mastery'
import { buildSession } from '../lib/sessionBuilder'
import { getAllQuestions } from '../data/questionBank'
import WeaknessReport from '../components/WeaknessReport'
import './DashboardScreen.css'

const ALL_QUESTIONS = getAllQuestions()

export default function DashboardScreen({ attempts, onSelect }) {
  const mastery = useMemo(() => computeAllMastery(attempts), [attempts])

  const { preview } = useMemo(
    () => buildSession(attempts, ALL_QUESTIONS, 8),
    [attempts],
  )

  const isFirstTime = attempts.length === 0

  const previewLabel = () => {
    const parts = []
    if (preview.wrong > 0)         parts.push(`${preview.wrong} from last session`)
    if (preview.fresh > 0)         parts.push(`${preview.fresh} new`)
    if (preview.reinforcement > 0) parts.push(`${preview.reinforcement} reinforcement`)
    if (parts.length === 0)        return 'No questions available yet'
    return parts.join(' · ')
  }

  return (
    <div className="dashboard">

      {isFirstTime ? (
        <div className="dash-card dash-welcome">
          <h2>Welcome to SQL Dry Run</h2>
          <p>Write real SQL queries, graded on method — not just whether you got the right rows.</p>
          <p className="dash-welcome-rec">
            <strong>New here?</strong> Start with the diagnostic to find your gaps in about 10 minutes.
          </p>
          <div className="dash-cta-row">
            <button className="btn-primary" onClick={() => onSelect('diagnostic')}>
              Start diagnostic →
            </button>
            <button className="btn-ghost" onClick={() => onSelect('practice')}>
              Jump into practice
            </button>
          </div>
        </div>
      ) : (
        <div className="dash-card dash-drill">
          <div className="dash-drill-header">
            <div>
              <h2>Your next drill</h2>
              <p className="dash-drill-preview">{previewLabel()}</p>
            </div>
            <span className="dash-drill-total">{preview.total} questions</span>
          </div>
          {preview.wrong > 0 && (
            <p className="dash-drill-note">
              ↩ {preview.wrong} question{preview.wrong > 1 ? 's' : ''} from last time coming back
            </p>
          )}
          <button
            className="btn-primary"
            disabled={preview.total === 0}
            onClick={() => onSelect('quick-drill')}
          >
            Start drill →
          </button>
        </div>
      )}

      <div className="dash-card">
        <h3 className="dash-section-heading">Your skills</h3>
        <div className="dash-skill-grid">
          {SKILLS.map(s => {
            const m   = mastery[s]
            const pct = m !== null && m !== undefined ? Math.round(m * 100) : null
            const isWeak = m !== null && m !== undefined && m < 0.6
            return (
              <button
                key={s}
                className={`dash-skill-row ${isWeak ? 'dash-skill-weak' : ''}`}
                onClick={() => onSelect('practice', s)}
              >
                <span className="dash-skill-name">{SKILL_LABELS[s]}</span>
                <div className="dash-meter-wrap">
                  <div
                    className="dash-meter-fill"
                    style={{
                      width: pct !== null ? `${pct}%` : '0%',
                      background: pct === null ? 'var(--border)'
                        : pct >= 60 ? 'var(--correct)'
                        : pct >= 30 ? 'var(--hardcode)'
                        : 'var(--incorrect)',
                    }}
                  />
                </div>
                <span className="dash-meter-pct">
                  {pct !== null ? `${pct}%` : '—'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {attempts.length > 0 && (
        <div className="dash-card">
          <h3 className="dash-section-heading">Where to focus</h3>
          <WeaknessReport mastery={mastery} wrongQuestions={[]} />
        </div>
      )}

      <div className="dash-card dash-modes">
        <h3 className="dash-section-heading">Modes</h3>
        <div className="dash-mode-row">
          <button className="dash-mode-btn" onClick={() => onSelect('diagnostic')}>
            <span className="dash-mode-title">Diagnostic</span>
            <span className="dash-mode-sub">Find your gaps</span>
          </button>
          <button className="dash-mode-btn" onClick={() => onSelect('practice')}>
            <span className="dash-mode-title">Practice</span>
            <span className="dash-mode-sub">Drill by skill</span>
          </button>
          <button className="dash-mode-btn" onClick={() => onSelect('mock')}>
            <span className="dash-mode-title">Mock Exam</span>
            <span className="dash-mode-sub">Timed test</span>
          </button>
        </div>
      </div>

    </div>
  )
}
