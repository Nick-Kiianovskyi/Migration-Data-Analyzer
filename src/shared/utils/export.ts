import * as XLSX from 'xlsx'
import type { ComparisonResult, FullComparisonResult } from '../types'

export function exportToXlsx(result: ComparisonResult, fullComparison?: FullComparisonResult | null): void {
  const workbook = XLSX.utils.book_new()

  const summaryData = createSummarySheet(result)
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  const newData = createRecordsSheet(
    result.records.filter((r) => r.status === 'added'),
    result.keyField
  )
  const newSheet = XLSX.utils.aoa_to_sheet(newData)
  newSheet['!cols'] = [{ wch: 20 }]
  XLSX.utils.book_append_sheet(workbook, newSheet, 'New')

  const deletedData = createRecordsSheet(
    result.records.filter((r) => r.status === 'removed'),
    result.keyField
  )
  const deletedSheet = XLSX.utils.aoa_to_sheet(deletedData)
  deletedSheet['!cols'] = [{ wch: 20 }]
  XLSX.utils.book_append_sheet(workbook, deletedSheet, 'Deleted')

  const changedData = createChangedSheet(
    result.records.filter((r) => r.status === 'modified'),
    result.keyField
  )
  const changedSheet = XLSX.utils.aoa_to_sheet(changedData)
  changedSheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 25 }]
  XLSX.utils.book_append_sheet(workbook, changedSheet, 'Changed')

  if (fullComparison && fullComparison.cells.length > 0) {
    const fullData = createFullCellSheet(fullComparison)
    const fullSheet = XLSX.utils.aoa_to_sheet(fullData)
    fullSheet['!cols'] = [{ wch: 8 }, { wch: 18 }, { wch: 25 }, { wch: 25 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(workbook, fullSheet, 'Full Cell Comparison')
  }

  const fileName = `comparison_${result.keyField}_${formatDate(new Date())}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

function createSummarySheet(result: ComparisonResult): (string | number)[][] {
  return [
    ['Migration Analysis Summary'],
    [],
    ['Key Field', result.keyField],
    ['Before File', result.beforeFileName],
    ['After File', result.afterFileName],
    ['Timestamp', formatTimestamp(result.timestamp)],
    [],
    ['Metric', 'Value'],
    ['Total Records Before', result.summary.totalBefore],
    ['Total Records After', result.summary.totalAfter],
    ['New Records', result.summary.added],
    ['Deleted Records', result.summary.removed],
    ['Modified Records', result.summary.modified],
    ['Unchanged Records', result.summary.matching],
    ['Total Field Changes', result.summary.totalFieldChanges],
  ]
}

function createRecordsSheet(
  records: ComparisonResult['records'],
  keyField: string
): (string | number)[][] {
  if (records.length === 0) {
    return [[keyField], ['No records']]
  }

  const allFields = new Set<string>()
  for (const record of records) {
    if (record.before) {
      Object.keys(record.before).forEach((f) => allFields.add(f))
    }
    if (record.after) {
      Object.keys(record.after).forEach((f) => allFields.add(f))
    }
  }

  const headers = [keyField, ...Array.from(allFields)]
  const rows = records.map((record) => {
    const row: (string | number)[] = [record.key]
    for (const field of allFields) {
      const value = record.after?.[field] ?? record.before?.[field] ?? ''
      row.push(value)
    }
    return row
  })

  return [headers, ...rows]
}

function createChangedSheet(
  records: ComparisonResult['records'],
  keyField: string
): (string | number)[][] {
  const headers = [keyField, 'Field Name', 'Old Value', 'New Value']

  if (records.length === 0) {
    return [headers, ['No changes']]
  }

  const rows: (string | number)[][] = []
  for (const record of records) {
    if (record.fieldChanges && record.fieldChanges.length > 0) {
      for (const fc of record.fieldChanges) {
        rows.push([
          record.key,
          fc.fieldName,
          fc.oldValue || '(empty)',
          fc.newValue || '(empty)',
        ])
      }
    }
  }

  return [headers, ...rows]
}

function createFullCellSheet(full: FullComparisonResult): (string | number)[][] {
  const headers = ['Row', 'Column', 'Before', 'After', 'Status']
  const rows: (string | number)[][] = []

  for (const cell of full.cells) {
    rows.push([
      cell.row,
      cell.column,
      cell.oldValue || '(empty)',
      cell.newValue || '(empty)',
      cell.status.charAt(0).toUpperCase() + cell.status.slice(1),
    ])
  }

  return [headers, ...rows]
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString()
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}_${hours}${minutes}`
}
