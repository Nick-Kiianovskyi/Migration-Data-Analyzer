import { useState, useMemo } from 'react'
import type { ComparisonResult } from '../../../shared/types'

interface FieldChangeRow {
  key: string
  fieldName: string
  oldValue: string
  newValue: string
}

interface FieldChangesTableProps {
  records: ComparisonResult['records']
  keyField: string
}

function FieldChangesTable({ records, keyField }: FieldChangesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const rowsPerPage = 15

  const allChanges = useMemo(() => {
    const changes: FieldChangeRow[] = []
    for (const record of records) {
      if (record.status === 'modified' && record.fieldChanges) {
        for (const fc of record.fieldChanges) {
          changes.push({
            key: record.key,
            fieldName: fc.fieldName,
            oldValue: fc.oldValue,
            newValue: fc.newValue,
          })
        }
      }
    }
    return changes
  }, [records])

  const filteredChanges = useMemo(() => {
    if (!searchTerm) return allChanges
    const term = searchTerm.toLowerCase()
    return allChanges.filter(
      (c) =>
        c.key.toLowerCase().includes(term) ||
        c.fieldName.toLowerCase().includes(term) ||
        c.oldValue.toLowerCase().includes(term) ||
        c.newValue.toLowerCase().includes(term)
    )
  }, [allChanges, searchTerm])

  const totalPages = Math.ceil(filteredChanges.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const currentChanges = filteredChanges.slice(startIndex, startIndex + rowsPerPage)

  const fieldCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of allChanges) {
      counts[c.fieldName] = (counts[c.fieldName] || 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [allChanges])

  if (allChanges.length === 0) {
    return null
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="p-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-900">Field-Level Changes</h4>
            <p className="text-sm text-gray-500 mt-1">
              {allChanges.length} total changes across {new Set(allChanges.map((c) => c.key)).size} records
            </p>
          </div>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search changes..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="input-field pl-10 w-full sm:w-64"
            />
          </div>
        </div>

        {fieldCounts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Most changed:</span>
            {fieldCounts.map(([field, count]) => (
              <span
                key={field}
                className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-md border border-gray-200"
              >
                {field}
                <span className="text-primary-600 font-medium">{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                {keyField}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                Field
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                Old Value
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                New Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentChanges.map((change, index) => (
              <tr
                key={`${change.key}-${change.fieldName}-${index}`}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">
                  {change.key}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
                    {change.fieldName}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs">
                  <span className={change.oldValue === '' ? 'text-gray-400 italic' : ''}>
                    {change.oldValue === '' ? '(empty)' : change.oldValue}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs">
                  <span className={change.newValue === '' ? 'text-gray-400 italic' : ''}>
                    {change.newValue === '' ? '(empty)' : change.newValue}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}–{Math.min(startIndex + rowsPerPage, filteredChanges.length)} of {filteredChanges.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FieldChangesTable
