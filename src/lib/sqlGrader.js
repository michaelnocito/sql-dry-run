import { bootSQL, freshDB, execQuery } from './sqlInit.js'

function toObjects(columns, rows) {
  return rows.map(row => {
    const obj = {}
    columns.forEach((col, i) => { obj[col.toLowerCase()] = row[i] })
    return obj
  })
}

function normalizeVal(v) {
  if (v === null || v === undefined) return 'null'
  return String(v).trim().toLowerCase()
}

function normalizeObj(obj) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) out[k.toLowerCase()] = normalizeVal(v)
  return out
}

function rowKey(row) {
  return JSON.stringify(Object.entries(row).sort((a, b) => a[0].localeCompare(b[0])))
}

function rowsMatch(userObjects, expectedRows, orderSensitive) {
  const normUser = userObjects.map(normalizeObj)
  const normExp  = expectedRows.map(normalizeObj)
  if (normUser.length !== normExp.length) return false
  if (orderSensitive) {
    return normUser.every((row, i) => rowKey(row) === rowKey(normExp[i]))
  }
  const expKeys = normExp.map(rowKey).sort()
  const usrKeys = normUser.map(rowKey).sort()
  return expKeys.every((k, i) => k === usrKeys[i])
}

export async function gradeSQL(question, userQuery) {
  await bootSQL()

  let userColumns, userRows
  try {
    const db = freshDB(question.schema)
    const res = execQuery(db, userQuery)
    userColumns = res.columns
    userRows    = res.rows
    db.close()
  } catch (e) {
    return {
      overallStatus: 'error',
      errorMessage:  e.message,
      userRows: [], userColumns: [],
      expectedRows: question.answerKey.expectedRows,
      rowCount: 0, expectedCount: question.answerKey.expectedRows.length,
      correct: 0, total: 1,
    }
  }

  const { expectedRows, requireKeywords = [], orderSensitive = false } = question.answerKey
  const userObjects     = toObjects(userColumns, userRows)
  const matched         = rowsMatch(userObjects, expectedRows, orderSensitive)
  const queryUpper      = userQuery.toUpperCase()
  const missingKeywords = requireKeywords.filter(kw => !queryUpper.includes(kw.toUpperCase()))
  const keywordsPass    = missingKeywords.length === 0

  let overallStatus
  if (matched && keywordsPass)       overallStatus = 'correct'
  else if (matched && !keywordsPass) overallStatus = 'hardcoded'
  else                               overallStatus = 'incorrect'

  return {
    overallStatus,
    rowsMatch:       matched,
    keywordsPass,
    missingKeywords,
    userRows,
    userColumns,
    expectedRows,
    rowCount:        userRows.length,
    expectedCount:   expectedRows.length,
    correct: overallStatus === 'correct' ? 1 : 0,
    total:   1,
  }
}
