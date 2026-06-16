import { SELECT_FILTER_QUESTIONS }  from './questions/select-filter'
import { AGGREGATION_QUESTIONS }    from './questions/aggregation'
import { JOINS_QUESTIONS }          from './questions/joins'
import { SUBQUERIES_QUESTIONS }     from './questions/subqueries'
import { WINDOW_FUNCTIONS_QUESTIONS } from './questions/window-functions'
import { STRING_DATE_QUESTIONS }    from './questions/string-date'
import { HEALTHCARE_QUESTIONS }     from './questions/healthcare-migration'
import { SKILLS }                   from '../lib/mastery'

export const QUESTION_BANK = {
  'select-filter':    SELECT_FILTER_QUESTIONS,
  'aggregation':      AGGREGATION_QUESTIONS,
  'joins':            JOINS_QUESTIONS,
  'subqueries':       SUBQUERIES_QUESTIONS,
  'window-functions': WINDOW_FUNCTIONS_QUESTIONS,
  'string-date':      STRING_DATE_QUESTIONS,
}

// Industry tracks — curated, scenario-driven question sets that reuse the core
// skills on domain data. Kept SEPARATE from QUESTION_BANK so they never leak
// into the general diagnostic / skill-practice / mock-exam flows.
const TRACK_BANK = {
  healthcare: HEALTHCARE_QUESTIONS,
}

export const TRACKS = [
  {
    id: 'healthcare',
    label: 'Healthcare Migration',
    blurb: 'Dedup MRNs · map legacy codes · FK integrity — real EHR-migration SQL',
    count: HEALTHCARE_QUESTIONS.length,
  },
]

export function getTrackQuestions(trackId) {
  return TRACK_BANK[trackId] ?? []
}

export function getQuestions(skill, difficulty) {
  return (QUESTION_BANK[skill] ?? []).filter(q => q.difficulty === difficulty)
}

export function getAvailableDifficulties(skill) {
  const qs = QUESTION_BANK[skill] ?? []
  return ['easy', 'medium', 'hard'].filter(d => qs.some(q => q.difficulty === d))
}

// 1 question per skill for the diagnostic — prefer medium, fall back to easy
export function getDiagnosticSet() {
  return SKILLS.map(skill => {
    const qs = QUESTION_BANK[skill] ?? []
    return (
      qs.find(q => q.difficulty === 'medium') ??
      qs.find(q => q.difficulty === 'easy')   ??
      null
    )
  }).filter(Boolean)
}

export function getAllQuestions() {
  return Object.values(QUESTION_BANK).flat()
}

// Mock exam: up to 3 per skill (easy + medium + hard)
export function getMockExamSet() {
  const result = []
  for (const skill of SKILLS) {
    const qs = QUESTION_BANK[skill] ?? []
    for (const diff of ['easy', 'medium', 'hard']) {
      const q = qs.find(q => q.difficulty === diff)
      if (q) result.push(q)
    }
  }
  return result
}
