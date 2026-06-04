// All gamification values derived from the append-only attempt log.
// Never store aggregates — always recompute.

export const SKILLS = [
  'select-filter',
  'aggregation',
  'joins',
  'subqueries',
  'window-functions',
  'string-date',
]

export const SKILL_LABELS = {
  'select-filter':    'SELECT & Filter',
  'aggregation':      'Aggregation',
  'joins':            'JOINs',
  'subqueries':       'Subqueries',
  'window-functions': 'Window Functions',
  'string-date':      'String & Date',
}

const POINTS_BY_DIFFICULTY = { easy: 10, medium: 20, hard: 30 }
const KEYWORD_BONUS         = 5
const MASTERY_WINDOW        = 10  // trailing attempts per skill
const WEAK_THRESHOLD        = 0.6
const LEVEL_THRESHOLDS      = [0, 150, 400, 800, 1400] // Novice→Master

export const LEVELS = ['Novice', 'Analyst', 'Senior', 'Expert', 'Master']

export function computeMastery(attempts, skill) {
  const skillAttempts = attempts.filter(a => a.skill === skill)
  const window        = skillAttempts.slice(-MASTERY_WINDOW)
  if (!window.length) return null
  return window.filter(a => a.correct).length / window.length
}

export function computeAllMastery(attempts) {
  return Object.fromEntries(SKILLS.map(s => [s, computeMastery(attempts, s)]))
}

export function computeStreak(attempts) {
  let streak = 0
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (attempts[i].correct) streak++
    else break
  }
  return streak
}

export function computePoints(attempts) {
  return attempts.reduce((sum, a) => {
    const base  = POINTS_BY_DIFFICULTY[a.difficulty] ?? 10
    const bonus = (a.correct && a.usedKeyword) ? KEYWORD_BONUS : 0
    return sum + (a.correct ? base + bonus : 0)
  }, 0)
}

export function computeLevel(points) {
  let level = 0
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) { level = i; break }
  }
  return level
}

export function getWeakestSkill(attempts) {
  const mastery = computeAllMastery(attempts)
  let weakest   = null
  let lowest    = Infinity
  for (const skill of SKILLS) {
    const m = mastery[skill]
    if (m !== null && m < lowest) { lowest = m; weakest = skill }
  }
  return lowest < WEAK_THRESHOLD ? weakest : null
}

export function pointsToNextLevel(points) {
  const level = computeLevel(points)
  if (level >= LEVEL_THRESHOLDS.length - 1) return null
  return LEVEL_THRESHOLDS[level + 1] - points
}
