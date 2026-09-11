import { compareWithDuckDB } from './duckdbEngine'
import { compareWithJs } from './jsEngine'
import type { ParsedFile, ComparisonResult } from '../types'

export type EngineName = 'duckdb' | 'js'

export interface EngineResult {
  result: ComparisonResult
  engine: EngineName
}

const DUCKDB_THRESHOLD_BYTES = 5 * 1024 * 1024

export async function compareWithBestEngine(
  beforeFile: ParsedFile,
  afterFile: ParsedFile,
  keyField: string
): Promise<EngineResult> {
  const totalSize = beforeFile.size + afterFile.size

  if (totalSize < DUCKDB_THRESHOLD_BYTES) {
    return {
      result: await compareWithJs(beforeFile, afterFile, keyField),
      engine: 'js',
    }
  }

  try {
    const result = await compareWithDuckDB(beforeFile, afterFile, keyField)
    console.log('[Engine] DuckDB WASM comparison completed')
    return { result, engine: 'duckdb' }
  } catch (err) {
    console.warn('[Engine] DuckDB comparison failed, falling back to JS:', err)
    return {
      result: await compareWithJs(beforeFile, afterFile, keyField),
      engine: 'js',
    }
  }
}