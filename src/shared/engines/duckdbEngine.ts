import * as duckdb from '@duckdb/duckdb-wasm'
import mvpWasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url'
import ehWasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'
import mvpWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?worker'
import ehWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?worker'
import type { ParsedFile, ComparisonResult, ComparedRecord, FieldChange } from '../types'

const QUOTE = '"'

function q(col: string): string {
  return QUOTE + col.replace(/"/g, '""') + QUOTE
}

function escapeCsv(value: string): string {
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

function toCsv(data: Record<string, string>[], columns: string[]): string {
  const header = columns.join(',')
  const rows = data.map((row) =>
    columns.map((col) => escapeCsv(row[col] ?? '')).join(',')
  )
  return [header, ...rows].join('\n') + '\n'
}

let dbInstance: duckdb.AsyncDuckDB | null = null
let initPromise: Promise<duckdb.AsyncDuckDB> | null = null

type WorkerConstructor = new () => Worker

async function getDB(): Promise<duckdb.AsyncDuckDB> {
  if (dbInstance) return dbInstance

  if (!initPromise) {
    initPromise = (async () => {
      const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
        mvp: {
          mainModule: mvpWasm,
          mainWorker: mvpWorker as unknown as string,
        },
        eh: {
          mainModule: ehWasm,
          mainWorker: ehWorker as unknown as string,
        },
      }

      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES)
      const workerCtor = bundle.mainWorker as unknown as WorkerConstructor | null
      if (!workerCtor) {
        throw new Error('Unable to select DuckDB worker bundle')
      }
      const worker = new workerCtor()
      const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING)
      const db = new duckdb.AsyncDuckDB(logger, worker)
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
      dbInstance = db
      return db
    })()
  }

  return initPromise
}

async function loadData(
  db: duckdb.AsyncDuckDB,
  conn: duckdb.AsyncDuckDBConnection,
  file: ParsedFile,
  tableName: string
): Promise<void> {
  const csv = toCsv(file.data, file.columns)
  const fileName = `${tableName}_${Date.now()}.csv`
  await db.registerFileText(fileName, csv)
  await conn.query(
    `CREATE TABLE ${tableName} AS SELECT * FROM read_csv('${fileName}', header=true, all_varchar=true)`
  )
}

interface KeyedFieldChange extends FieldChange {
  key: string
}

function toRecord(row: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(row)) {
    result[key] = value === null ? '' : String(value)
  }
  return result
}

export async function compareWithDuckDB(
  beforeFile: ParsedFile,
  afterFile: ParsedFile,
  keyField: string
): Promise<ComparisonResult> {
  const db = await getDB()
  const conn = await db.connect()

  try {
    const keyQ = q(keyField)

    await loadData(db, conn, beforeFile, 'before_data')
    await loadData(db, conn, afterFile, 'after_data')

    const beforeCount = Number(
      (await conn.query('SELECT COUNT(*) AS c FROM before_data')).toArray()[0].c
    )
    const afterCount = Number(
      (await conn.query('SELECT COUNT(*) AS c FROM after_data')).toArray()[0].c
    )

    const addedRows = await conn.query(`
      SELECT a.* FROM after_data a
      LEFT JOIN before_data b ON a.${keyQ} = b.${keyQ}
      WHERE b.${keyQ} IS NULL
    `)

    const removedRows = await conn.query(`
      SELECT b.* FROM before_data b
      LEFT JOIN after_data a ON a.${keyQ} = b.${keyQ}
      WHERE a.${keyQ} IS NULL
    `)

    const keysInBoth = await conn.query(`
      SELECT COUNT(*) AS c FROM (
        SELECT b.${keyQ} AS k FROM before_data b
        INTERSECT
        SELECT a.${keyQ} AS k FROM after_data a
      )
    `)
    const keysInBothCount = Number(keysInBoth.toArray()[0].c)

    const added = rowsToRecords(addedRows, 'added', keyField)
    const removed = rowsToRecords(removedRows, 'removed', keyField)

    const keyedChanges = await getFieldChanges(conn, keyQ, keyField, beforeFile.columns)
    const changed = await buildChangedRecords(conn, keyQ, keyedChanges, keyField)

    const modified = changed.length
    const matching = Math.max(keysInBothCount - modified, 0)
    const totalFieldChanges = keyedChanges.length

    return {
      keyField,
      beforeFileName: beforeFile.name,
      afterFileName: afterFile.name,
      timestamp: new Date().toISOString(),
      summary: {
        totalBefore: beforeCount,
        totalAfter: afterCount,
        added: added.length,
        removed: removed.length,
        matching,
        modified,
        totalFieldChanges,
      },
      records: [...added, ...removed, ...changed],
    }
  } finally {
    await cleanupTables(conn)
    await conn.close()
  }
}

async function getFieldChanges(
  conn: duckdb.AsyncDuckDBConnection,
  keyQ: string,
  keyField: string,
  columns: string[]
): Promise<KeyedFieldChange[]> {
  const chunks: string[] = []

  for (const col of columns) {
    if (col === keyField) continue
    const colQ = q(col)
    chunks.push(`
      SELECT
        a.${keyQ} AS k,
        '${col.replace(/'/g, "''")}' AS field_name,
        CAST(b.${colQ} AS VARCHAR) AS old_value,
        CAST(a.${colQ} AS VARCHAR) AS new_value
      FROM before_data b
      JOIN after_data a ON a.${keyQ} = b.${keyQ}
      WHERE b.${colQ} IS DISTINCT FROM a.${colQ}
    `)
  }

  if (chunks.length === 0) {
    return []
  }

  const rows = await conn.query(chunks.join(' UNION ALL '))
  const changes: KeyedFieldChange[] = []

  for (const row of rows.toArray() as unknown as Record<string, unknown>[]) {
    changes.push({
      key: String(row.k ?? ''),
      fieldName: String(row.field_name),
      oldValue: row.old_value === null ? '' : String(row.old_value),
      newValue: row.new_value === null ? '' : String(row.new_value),
    })
  }

  return changes
}

function rowsToRecords(
  arrowTable: unknown,
  status: 'added' | 'removed',
  keyField: string
): ComparedRecord[] {
  const rows = (arrowTable as { toArray: () => Record<string, unknown>[] }).toArray()
  const records: ComparedRecord[] = []

  for (const row of rows) {
    const data = toRecord(row)
    records.push({
      key: data[keyField] ?? '',
      status,
      before: status === 'removed' ? data : null,
      after: status === 'added' ? data : null,
    })
  }

  return records
}

async function buildChangedRecords(
  conn: duckdb.AsyncDuckDBConnection,
  keyQ: string,
  changes: KeyedFieldChange[],
  keyField: string
): Promise<ComparedRecord[]> {
  if (changes.length === 0) return []

  const grouped = new Map<string, KeyedFieldChange[]>()
  for (const change of changes) {
    const group = grouped.get(change.key)
    if (group) {
      group.push(change)
    } else {
      grouped.set(change.key, [change])
    }
  }

  const keys = Array.from(grouped.keys())
  const keyList = keys
    .map((k) => `'${k.replace(/'/g, "''")}'`)
    .join(',')

  const beforeRows = await conn.query(
    `SELECT * FROM before_data WHERE ${keyQ} IN (${keyList})`
  )
  const afterRows = await conn.query(
    `SELECT * FROM after_data WHERE ${keyQ} IN (${keyList})`
  )

  const beforeMap = new Map<string, Record<string, string>>()
  for (const row of beforeRows.toArray() as unknown as Record<string, unknown>[]) {
    const data = toRecord(row)
    beforeMap.set(data[keyField] ?? '', data)
  }

  const afterMap = new Map<string, Record<string, string>>()
  for (const row of afterRows.toArray() as unknown as Record<string, unknown>[]) {
    const data = toRecord(row)
    afterMap.set(data[keyField] ?? '', data)
  }

  const records: ComparedRecord[] = []
  for (const [key, fieldChanges] of grouped.entries()) {
    records.push({
      key,
      status: 'modified',
      before: beforeMap.get(key) ?? null,
      after: afterMap.get(key) ?? null,
      changedFields: fieldChanges.map((f) => f.fieldName),
      fieldChanges: fieldChanges.map(({ key: _key, ...rest }) => rest),
    })
  }

  return records
}

async function cleanupTables(conn: duckdb.AsyncDuckDBConnection): Promise<void> {
  try {
    await conn.query('DROP TABLE IF EXISTS before_data')
    await conn.query('DROP TABLE IF EXISTS after_data')
  } catch {
    // ignore cleanup errors
  }
}