import { useState, useMemo } from 'react'
import type { ComparedRecord, RecordStatus } from '../../../shared/types'

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface RecordsTableProps {
  records: ComparedRecord[]
  keyField: string
  title: string
  showFieldChanges?: boolean
}

function RecordsTable({ records, keyField, title, showFieldChanges = false }: RecordsTableProps) {
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const rowsPerPage = 10

  const filteredRecords = useMemo(() => {
    if (!search) return records
    const term = search.toLowerCase()
    return records.filter((record) => {
      if (record.key.toLowerCase().includes(term)) return true
      if (record.before) {
        for (const val of Object.values(record.before)) {
          if (String(val).toLowerCase().includes(term)) return true
        }
      }
      if (record.after) {
        for (const val of Object.values(record.after)) {
          if (String(val).toLowerCase().includes(term)) return true
        }
      }
      if (record.changedFields?.some((f: string) => f.toLowerCase().includes(term))) return true
      return false
    })
  }, [records, search])

  const sortedRecords = useMemo(() => {
    if (!sortConfig) return filteredRecords

    return [...filteredRecords].sort((a, b) => {
      let aVal: string
      let bVal: string

      if (sortConfig.key === keyField) {
        aVal = a.key
        bVal = b.key
      } else if (sortConfig.key === 'changedFields') {
        aVal = a.changedFields?.join(', ') || ''
        bVal = b.changedFields?.join(', ') || ''
      } else {
        aVal = a.before?.[sortConfig.key] || a.after?.[sortConfig.key] || ''
        bVal = b.before?.[sortConfig.key] || b.after?.[sortConfig.key] || ''
      }

      const comparison = aVal.localeCompare(bVal, undefined, { numeric: true })
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [filteredRecords, sortConfig, keyField])

  const totalPages = Math.ceil(sortedRecords.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const currentRecords = sortedRecords.slice(startIndex, startIndex + rowsPerPage)

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  const getStatusBadge = (status: RecordStatus) => {
    const config: Record<RecordStatus, { label: string; className: string }> = {
      added: { label: 'New', className: 'bg-accent-100 text-accent-700' },
      removed: { label: 'Deleted', className: 'bg-red-100 text-red-700' },
      modified: { label: 'Modified', className: 'bg-amber-100 text-amber-700' },
      unchanged: { label: 'Unchanged', className: 'bg-gray-100 text-gray-600' },
    }
    const { label, className } = config[status]
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${className}`}>
        {label}
      </span>
    )
  }

  if (records.length === 0) {
    return (
      <div className="card text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500">No records to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className="input-field pl-10 w-full sm:w-72"
          />
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th
                  onClick={() => handleSort(keyField)}
                  className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {keyField}
                    {getSortIcon(keyField)}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Status
                </th>
                {showFieldChanges && (
                  <th
                    onClick={() => handleSort('changedFields')}
                    className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Changed Fields
                      {getSortIcon('changedFields')}
                    </div>
                  </th>
                )}
                <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentRecords.map((record) => (
                <>
                  <tr
                    key={record.key}
                    className={`
                      hover:bg-gray-50/50 transition-colors
                      ${record.status === 'added' ? 'bg-accent-50/20' : ''}
                      ${record.status === 'removed' ? 'bg-red-50/20' : ''}
                      ${record.status === 'modified' ? 'bg-amber-50/20' : ''}
                    `}
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">
                      {record.key}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    {showFieldChanges && (
                      <td className="px-4 py-3 text-gray-600">
                        {record.changedFields && record.changedFields.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {record.changedFields.slice(0, 3).map((field: string) => (
                              <span key={field} className="inline-flex px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                                {field}
                              </span>
                            ))}
                            {record.changedFields.length > 3 && (
                              <span className="text-xs text-gray-500">+{record.changedFields.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpandedRow(expandedRow === record.key ? null : record.key)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                      >
                        {expandedRow === record.key ? 'Hide' : 'View'}
                        <svg
                          className={`w-4 h-4 transition-transform ${expandedRow === record.key ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {expandedRow === record.key && (
                    <tr key={`${record.key}-expanded`}>
                      <td colSpan={showFieldChanges ? 4 : 3} className="px-4 py-4 bg-gray-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {record.before && (
                            <div>
                              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Before</h5>
                              <div className="bg-white rounded-lg border border-gray-200 p-3 text-sm">
                                {Object.entries(record.before).map(([field, value]: [string, string]) => (
                                  <div key={field} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span className="text-gray-500">{field}</span>
                                    <span className="text-gray-900 font-medium text-right max-w-[60%] truncate" title={value}>
                                      {value || <span className="text-gray-400 italic">empty</span>}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {record.after && (
                            <div>
                              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">After</h5>
                              <div className="bg-white rounded-lg border border-gray-200 p-3 text-sm">
                                {Object.entries(record.after).map(([field, value]: [string, string]) => (
                                  <div key={field} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span className="text-gray-500">{field}</span>
                                    <span className="text-gray-900 font-medium text-right max-w-[60%] truncate" title={value}>
                                      {value || <span className="text-gray-400 italic">empty</span>}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50 gap-3">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}–{Math.min(startIndex + rowsPerPage, sortedRecords.length)} of {sortedRecords.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="btn-secondary text-sm py-1.5 px-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary text-sm py-1.5 px-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-gray-600 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary text-sm py-1.5 px-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="btn-secondary text-sm py-1.5 px-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecordsTable
