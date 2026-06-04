// Smart session builder — composes a question set from the attempt log.
// Wrong questions always resurface next session.
// Fresh questions fill remaining slots.
// Reinforcement (old correct answers) peppered in last.
// Cooling (recently correct) skipped — give them space.

const COOLING_MS       = 48 * 60 * 60 * 1000  // 48 h — skip if correct this recently
const REINFORCEMENT_MS =  7 * 24 * 60 * 60 * 1000  // 7 d — eligible for reinforcement

export function getQuestionStatus(questionAttempts, now = Date.now()) {
  if (!questionAttempts || questionAttempts.length === 0) return 'new'
  const last = questionAttempts[questionAttempts.length - 1]
  const age  = now - last.ts
  if (!last.correct)          return 'due_wrong'
  if (age < COOLING_MS)       return 'cooling'
  if (age < REINFORCEMENT_MS) return 'reinforcement'
  return 'new'  // correct but old enough to revisit fresh
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

// Returns { questions[], preview{ wrong, fresh, reinforcement, total }, available{...} }
export function buildSession(allAttempts, questionPool, sessionSize = 8) {
  const now = Date.now()

  const byQ = {}
  for (const a of allAttempts) {
    if (!byQ[a.questionId]) byQ[a.questionId] = []
    byQ[a.questionId].push(a)
  }

  const wrong = [], fresh = [], reinforce = []
  for (const q of questionPool) {
    const status = getQuestionStatus(byQ[q.questionId] ?? [], now)
    if (status === 'due_wrong')    wrong.push(q)
    else if (status === 'new')     fresh.push(q)
    else if (status === 'reinforcement') reinforce.push(q)
    // cooling → deliberately omitted
  }

  const chosen = []
  const addedWrong    = wrong.slice(0, sessionSize)
  chosen.push(...addedWrong)
  const addedFresh    = shuffle(fresh).slice(0, sessionSize - chosen.length)
  chosen.push(...addedFresh)
  const addedReinforce = shuffle(reinforce).slice(0, sessionSize - chosen.length)
  chosen.push(...addedReinforce)

  return {
    questions: chosen,
    preview: {
      wrong:         addedWrong.length,
      fresh:         addedFresh.length,
      reinforcement: addedReinforce.length,
      total:         chosen.length,
    },
    available: {
      wrong:         wrong.length,
      fresh:         fresh.length,
      reinforcement: reinforce.length,
    },
  }
}

// Sort a question list by priority without filtering (for practice mode)
export function sortByPriority(allAttempts, questions) {
  const now = Date.now()
  const byQ = {}
  for (const a of allAttempts) {
    if (!byQ[a.questionId]) byQ[a.questionId] = []
    byQ[a.questionId].push(a)
  }
  const ORDER = { due_wrong: 0, new: 1, reinforcement: 2, cooling: 3 }
  return [...questions].sort((a, b) => {
    const sa = ORDER[getQuestionStatus(byQ[a.questionId] ?? [], now)] ?? 4
    const sb = ORDER[getQuestionStatus(byQ[b.questionId] ?? [], now)] ?? 4
    return sa - sb
  })
}
