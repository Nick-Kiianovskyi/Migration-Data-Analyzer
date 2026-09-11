import type { ParsedFile, CellComparison, FullComparisonResult } from '../types'

export function compareFilesFull(
  beforeFile: ParsedFile,
  afterFile: ParsedFile
): FullComparisonResult {
  const allColumns = new Set<string>([
    ...beforeFile.columns,
    ...afterFile.columns,
  ])
  const columns = Array.from(allColumns)

  const maxRows = Math.max(beforeFile.rowCount, afterFile.rowCount)
  const cells: CellComparison[] = []

  let equalCells = 0
  let changedCells = 0
  let missingCells = 0

  for (let i = 0; i < maxRows; i += 1) {
    const beforeRow = beforeFile.data[i] ?? null
    const afterRow = afterFile.data[i] ?? null

    for (const col of columns) {
      const oldVal = beforeRow?.[col] ?? ''
      const newVal = afterRow?.[col] ?? ''

      let status: CellComparison['status']
      if (oldVal === newVal) {
        status = 'equal'
        equalCells++
      } else if (oldVal === '' || newVal === '') {
        status = 'missing'
        missingCells++
      } else {
        status = 'changed'
        changedCells++
      }

      cells.push({
        row: i + 1,
        column: col,
        oldValue: oldVal,
        newValue: newVal,
        status,
      })
    }
  }

  return {
    beforeFileName: beforeFile.name,
    afterFileName: afterFile.name,
    timestamp: new Date().toISOString(),
    columns,
    totalCells: cells.length,
    equalCells,
    changedCells,
    missingCells,
    cells,
  }
}
