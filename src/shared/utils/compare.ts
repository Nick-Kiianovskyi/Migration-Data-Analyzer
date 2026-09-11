import type { ParsedFile, ComparedRecord, ComparisonResult, FieldChange } from '../types'

export function compareFiles(
  beforeFile: ParsedFile,
  afterFile: ParsedFile,
  keyField: string
): ComparisonResult {
  const beforeMap = new Map<string, Record<string, string>>()
  const afterMap = new Map<string, Record<string, string>>()

  for (const row of beforeFile.data) {
    const key = row[keyField]
    if (key) {
      beforeMap.set(key, row)
    }
  }

  for (const row of afterFile.data) {
    const key = row[keyField]
    if (key) {
      afterMap.set(key, row)
    }
  }

  const records: ComparedRecord[] = []
  const allKeys = new Set([...beforeMap.keys(), ...afterMap.keys()])

  let added = 0
  let removed = 0
  let unchanged = 0
  let modified = 0
  let totalFieldChanges = 0

  for (const key of allKeys) {
    const beforeRow = beforeMap.get(key) || null
    const afterRow = afterMap.get(key) || null

    if (beforeRow && !afterRow) {
      removed++
      records.push({
        key,
        status: 'removed',
        before: beforeRow,
        after: null,
      })
    } else if (!beforeRow && afterRow) {
      added++
      records.push({
        key,
        status: 'added',
        before: null,
        after: afterRow,
      })
    } else if (beforeRow && afterRow) {
      const fieldChanges = getFieldChanges(beforeRow, afterRow)
      if (fieldChanges.length > 0) {
        totalFieldChanges += fieldChanges.length
        modified++
        records.push({
          key,
          status: 'modified',
          before: beforeRow,
          after: afterRow,
          changedFields: fieldChanges.map((f) => f.fieldName),
          fieldChanges,
        })
      } else {
        unchanged++
        records.push({
          key,
          status: 'unchanged',
          before: beforeRow,
          after: afterRow,
        })
      }
    }
  }

  return {
    keyField,
    beforeFileName: beforeFile.name,
    afterFileName: afterFile.name,
    timestamp: new Date().toISOString(),
    summary: {
      totalBefore: beforeFile.rowCount,
      totalAfter: afterFile.rowCount,
      added,
      removed,
      matching: unchanged,
      modified,
      totalFieldChanges,
    },
    records,
  }
}

function getFieldChanges(
  before: Record<string, string>,
  after: Record<string, string>
): FieldChange[] {
  const changes: FieldChange[] = []
  const allFields = new Set([...Object.keys(before), ...Object.keys(after)])

  for (const field of allFields) {
    const oldVal = before[field] ?? ''
    const newVal = after[field] ?? ''

    if (oldVal !== newVal) {
      changes.push({
        fieldName: field,
        oldValue: oldVal,
        newValue: newVal,
      })
    }
  }

  return changes
}
