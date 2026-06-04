import { useEffect, useRef, useState, useCallback } from 'react'
import { bootSQL, freshDB, execQuery } from '../lib/sqlInit'
import { gradeSQL } from '../lib/sqlGrader'
import { logAttempt } from '../lib/db'
import FeedbackPanel from './FeedbackPanel'
import './SQLQuestionView.css'

export default function SQLQuestionView({
  question,
  questionIndex,
  totalQuestions,
  onNext,
  onAttemptLogged,
  onGraded,
  feedbackEnabled = true,
  hintsEnabled    = true,
}) {
  const [sqlQuery, setSqlQuery]       = useState('')
  const [phase, setPhase]             = useState('working')  // working | grading | done
  const [runResult, setRunResult]     = useState(null)       // { columns, rows } | { error }
  const [gradeResult, setGradeResult] = useState(null)
  const [hintsShown, setHintsShown]   = useState(0)
  const [engineReady, setEngineReady] = useState(false)
  const [engineError, setEngineError] = useState(null)
  const hintsRef = useRef(0)

  useEffect(() => {
    bootSQL()
      .then(() => setEngineReady(true))
      .catch(e => setEngineError(String(e)))
  }, [])

  useEffect(() => {
    setSqlQuery('')
    setPhase('working')
    setRunResult(null)
    setGradeResult(null)
    setHintsShown(0)
    hintsRef.current = 0
  }, [question.questionId])

  const handleRun = useCallback(async () => {
    if (!engineReady || !sqlQuery.trim()) return
    try {
      const db  = freshDB(question.schema)
      const res = execQuery(db, sqlQuery)
      db.close()
      setRunResult({ columns: res.columns, rows: res.rows })
    } catch (e) {
      setRunResult({ error: e.message })
    }
  }, [engineReady, sqlQuery, question.schema])

  const handleSubmit = useCallback(async () => {
    if (phase !== 'working' || !engineReady) return
    setPhase('grading')

    const result = await gradeSQL(question, sqlQuery)

    const attempt = {
      questionId:  question.questionId,
      skill:       question.skill,
      difficulty:  question.difficulty,
      ts:          Date.now(),
      correct:     result.overallStatus === 'correct',
      usedKeyword: result.keywordsPass ?? false,
      hintsUsed:   hintsRef.current,
    }

    try { await logAttempt(attempt) } catch (e) { console.warn('logAttempt failed', e) }
    onAttemptLogged?.()
    onGraded?.(result)

    if (result.userColumns?.length > 0 || result.userRows?.length > 0) {
      setRunResult({ columns: result.userColumns ?? [], rows: result.userRows ?? [] })
    } else if (result.overallStatus === 'error') {
      setRunResult({ error: result.errorMessage })
    }

    setGradeResult(result)
    setPhase('done')
  }, [phase, engineReady, sqlQuery, question])

  const showNextHint = () => {
    const next = Math.min(hintsShown + 1, question.hints.length)
    setHintsShown(next)
    hintsRef.current = next
  }

  const canRun    = engineReady && sqlQuery.trim().length > 0 && phase === 'working'
  const canSubmit = engineReady && sqlQuery.trim().length > 0 && phase === 'working'
  const diffLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }[question.difficulty] ?? question.difficulty
  const skillLabel = question.skill.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const statusIcon = { correct: '✓', hardcoded: '~', incorrect: '✗', error: '!' }

  if (engineError) {
    return (
      <div className="qv-init-error">
        <strong>SQL engine failed to load.</strong>
        <p>Check your connection and reload.</p>
        <code>{engineError}</code>
      </div>
    )
  }

  return (
    <div className="qv-layout">

      {/* ── Sidebar ── */}
      <div className="qv-sidebar">
        <div className="qv-meta">
          <span className="badge badge-skill">{skillLabel}</span>
          <span className={`badge badge-diff badge-${question.difficulty}`}>{diffLabel}</span>
          <span className="qv-progress">{questionIndex + 1} / {totalQuestions}</span>
        </div>

        <div className="qv-prompt">
          <h2 className="qv-prompt-heading">Your task</h2>
          <p className="qv-prompt-text">{question.prompt}</p>
        </div>

        <details className="qv-schema">
          <summary className="qv-schema-summary">Tables</summary>
          <pre className="qv-schema-pre">{question.schema}</pre>
        </details>

        {hintsEnabled && phase === 'working' && question.hints.length > 0 && (
          <div className="qv-hints">
            {question.hints.slice(0, hintsShown).map((h, i) => (
              <div key={i} className="hint-item">
                <span className="hint-num">Hint {i + 1}</span>
                <p>{h}</p>
              </div>
            ))}
            {hintsShown < question.hints.length && (
              <button className="btn-hint" onClick={showNextHint}>
                {hintsShown === 0 ? 'Show a hint' : 'Next hint'}
              </button>
            )}
          </div>
        )}

        {phase === 'working' && (
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {engineReady ? 'Submit answer' : 'Loading SQL engine…'}
          </button>
        )}

        {phase === 'grading' && (
          <div className="qv-grading">Grading…</div>
        )}

        {phase === 'done' && gradeResult && feedbackEnabled && (
          <FeedbackPanel
            result={gradeResult}
            question={question}
            onNext={onNext}
            isLast={questionIndex === totalQuestions - 1}
          />
        )}

        {phase === 'done' && gradeResult && !feedbackEnabled && (
          <div className="qv-minimal-done">
            <span className={`qv-mini-status status-${gradeResult.overallStatus}`}>
              {statusIcon[gradeResult.overallStatus]} Recorded
            </span>
            <button className="btn-submit" onClick={onNext}>
              {questionIndex === totalQuestions - 1 ? 'See results →' : 'Next →'}
            </button>
          </div>
        )}
      </div>

      {/* ── Editor + Results area ── */}
      <div className="qv-editor-area">

        <div className="qv-editor-section">
          <div className="qv-panel-header">
            <span className="qv-panel-label">SQL</span>
            <button
              className="btn-run"
              onClick={handleRun}
              disabled={!canRun}
            >
              ▶ Run
            </button>
          </div>
          <textarea
            className="qv-sql-editor"
            value={sqlQuery}
            onChange={e => setSqlQuery(e.target.value)}
            placeholder="SELECT ..."
            spellCheck={false}
            readOnly={phase === 'done'}
            onKeyDown={e => {
              // Tab inserts 2 spaces
              if (e.key === 'Tab') {
                e.preventDefault()
                const { selectionStart: s, selectionEnd: end } = e.target
                const v = sqlQuery
                setSqlQuery(v.slice(0, s) + '  ' + v.slice(end))
                requestAnimationFrame(() => {
                  e.target.selectionStart = e.target.selectionEnd = s + 2
                })
              }
            }}
          />
        </div>

        <div className="qv-results-section">
          <div className="qv-panel-header">
            <span className="qv-panel-label">Results</span>
            {runResult && !runResult.error && (
              <span className="qv-row-count">
                {runResult.rows.length} row{runResult.rows.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {!runResult && (
            <div className="qv-results-empty">Run your query to preview results</div>
          )}
          {runResult?.error && (
            <div className="qv-results-error">
              <strong>SQL error</strong>
              <code>{runResult.error}</code>
            </div>
          )}
          {runResult && !runResult.error && runResult.columns.length === 0 && (
            <div className="qv-results-empty">Query returned no rows</div>
          )}
          {runResult && !runResult.error && runResult.columns.length > 0 && (
            <div className="qv-results-scroll">
              <table className="qv-results-table">
                <thead>
                  <tr>{runResult.columns.map(c => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {runResult.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>
                          {cell === null
                            ? <span className="null-val">NULL</span>
                            : String(cell)
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
