import { useState, useMemo } from 'react'
import type { FullComparisonResult, CellStatus } from '@shared/types'

interface FullComparisonTableProps {
  result: FullComparisonResult
}

type FilterStatus = 'all' | 'changed' | 'missing' | 'equal'

const STATUS_STYLE: Record<CellStatus, { label: string; bg: string; badge: string }> = {
  equal: { label: 'Equal', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  changed: { label: 'Changed', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
  missing: { label: 'Missing', bg: 'bg-gray-100', badge: 'bg-gray-200 text-gray-600' },
}

const ROWS_PER_PAGE = 20

function FullComparisonTable({ result }: FullComparisonTableProps) {
  const [filter, setFilter] = useState<FilterStatus>('changed')
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = result.cells
    if (filter !== 'all') {
      list = list.filter((c) => c.status === filter)
    }
    if (search) {
      const term = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.column.toLowerCase().includes(term) ||
          c.oldValue.toLowerCase().includes(term) ||
          c.newValue.toLowerCase().includes(term) ||
          String(c.row).includes(term)
      )
    }
    return list
  }, [result.cells, filter, search])

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE)
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE
  const page = filtered.slice(startIndex, startIndex + ROWS_PER_PAGE)

  const handleFilterChange = (f: FilterStatus) => {
    setFilter(f)
    setCurrentPage(1)
  }

  const filterButtons: { key: FilterStatus; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: result.totalCells },
    { key: 'changed', label: 'Changed', count: result.changedCells },
    { key: 'missing', label: 'Missing', count: result.missingCells },
    { key: 'equal', label: 'Equal', count: result.equalCells },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Full Cell Comparison</h3>
          <p className="text-sm text-gray-500 mt-1">
            {result.totalCells.toLocaleString()} cells compared across{' '}
            {result.columns.length} columns
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
            placeholder="Search cells..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className="input-field pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => handleFilterChange(btn.key)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${filter === btn.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }
            `}
          >
            {btn.label}
            <span className="ml-1.5 text-xs opacity-75">
              {btn.count.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Row
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Column
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Before
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  After
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {page.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    No cells match the current filter
                  </td>
                </tr>
              ) : (
                page.map((cell, idx) => (
                  <tr
                    key={`${cell.row}-${cell.column}-${idx}`}
                    className={`${STATUS_STYLE[cell.status].bg} hover:opacity-80 transition-opacity`}
                  >
                    <td className="px-4 py-2.5 text-gray-900 font-medium whitespace-nowrap tabular-nums">
                      {cell.row}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700">
                        {cell.column}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 max-w-[240px] truncate" title={cell.oldValue}>
                      {cell.oldValue === '' ? (
                        <span className="text-gray-400 italic">(empty)</span>
                      ) : (
                        cell.oldValue
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 max-w-[240px] truncate" title={cell.newValue}>
                      {cell.newValue === '' ? (
                        <span className="text-gray-400 italic">(empty)</span>
                      ) : (
                        cell.newValue
                      )}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[cell.status].badge}`}>
                        {STATUS_STYLE[cell.status].label}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50 gap-3">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}–{Math.min(startIndex + ROWS_PER_PAGE, filtered.length)} of{' '}
              {filtered.length.toLocaleString()}
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

export default FullComparisonTable