import { SELECT_FILTER_QUESTIONS } from './questions/select-filter'
import { SKILLS }                  from '../lib/mastery'

// Phase 1: select-filter placeholder only.
// Phase 4 adds full banks for all 6 skills.
export const QUESTION_BANK = {
  'select-filter':    SELECT_FILTER_QUESTIONS,
  'aggregation':      [],
  'joins':            [],
  'subqueries':       [],
  'window-functions': [],
  'string-date':      [],
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
