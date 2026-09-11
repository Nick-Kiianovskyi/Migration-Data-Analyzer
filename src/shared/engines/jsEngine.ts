import { compareFiles } from '../utils/compare'
import type { ParsedFile, ComparisonResult } from '../types'

export async function compareWithJs(
  beforeFile: ParsedFile,
  afterFile: ParsedFile,
  keyField: string
): Promise<ComparisonResult> {
  return compareFiles(beforeFile, afterFile, keyField)
}