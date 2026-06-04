const SQL_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/'
let _SQL = null

export async function bootSQL() {
  if (_SQL) return _SQL
  _SQL = await window.initSqlJs({ locateFile: f => `${SQL_CDN}${f}` })
  return _SQL
}

export function freshDB(schema) {
  const db = new _SQL.Database()
  db.run(schema)
  return db
}

export function execQuery(db, sql) {
  const res = db.exec(sql)
  if (!res.length) return { columns: [], rows: [] }
  return { columns: res[0].columns, rows: res[0].values }
}
