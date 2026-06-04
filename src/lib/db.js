// Append-only attempt log + session recovery store.
// Mastery/streak/points are always derived from the log — never stored.

const DB_NAME    = 'sql-dry-run'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('attempts')) {
        db.createObjectStore('attempts', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('session')) {
        db.createObjectStore('session')
      }
    }
    req.onsuccess = e => resolve(e.target.result)
    req.onerror   = e => reject(e.target.error)
  })
}

// Fields: questionId, skill, difficulty, ts, correct, usedKeyword, hintsUsed.
export async function logAttempt(attempt) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction('attempts', 'readwrite')
    const req = tx.objectStore('attempts').add(attempt)
    req.onsuccess = e => resolve(e.target.result)
    tx.onerror    = e => reject(e.target.error)
  })
}

export async function loadAllAttempts() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction('attempts', 'readonly')
    const req = tx.objectStore('attempts').getAll()
    req.onsuccess = e => resolve(e.target.result)
    tx.onerror    = e => reject(e.target.error)
  })
}

export async function saveSession(data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('session', 'readwrite')
    tx.objectStore('session').put({ ...data, savedAt: Date.now() }, 'active')
    tx.oncomplete = resolve
    tx.onerror    = e => reject(e.target.error)
  })
}

export async function loadSession() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction('session', 'readonly')
    const req = tx.objectStore('session').get('active')
    req.onsuccess = e => resolve(e.target.result || null)
    tx.onerror    = e => reject(e.target.error)
  })
}

export async function clearSession() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('session', 'readwrite')
    tx.objectStore('session').delete('active')
    tx.oncomplete = resolve
    tx.onerror    = e => reject(e.target.error)
  })
}
