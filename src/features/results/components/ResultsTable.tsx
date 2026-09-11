import { useState } from 'react'
import type { ResultsTableProps } from './ResultsPage.tsx.types'
import type { RecordStatus } from '../../../shared/types'

const STATUS_CONFIG: Record<RecordStatus, { label: string; className: string }> = {
  added: { label: 'Added', className: 'bg-accent-100 text-accent-700' },
  removed: { label: 'Removed', className: 'bg-red-100 text-red-700' },
  modified: { label: 'Modified', className: 'bg-amber-100 text-amber-700' },
  unchanged: { label: 'Unchanged', className: 'bg-gray-100 text-gray-600' },
}

function ResultsTable({ records, keyField }: ResultsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<RecordStatus | 'all'>('all')
  const rowsPerPage = 10

  const filteredRecords = records.filter(
    (r) => statusFilter === 'all' || r.status === statusFilter
  )

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const currentRecords = filteredRecords.slice(startIndex, startIndex + rowsPerPage)

  const statusCounts = records.reduce(
    (acc, r) => {
      acc[r.status]++
      return acc
    },
    { added: 0, removed: 0, modified: 0, unchanged: 0 }
  )

  if (!records || records.length === 0) {
    return (
      <div className="card text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-500">No data to display</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="p-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setStatusFilter('all'); setCurrentPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All ({records.length})
          </button>
          {(Object.keys(statusCounts) as RecordStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setCurrentPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {STATUS_CONFIG[status].label} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                {keyField}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                Changed Fields
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentRecords.map((record) => (
              <tr
                key={record.key}
                className={`hover:bg-gray-50/50 transition-colors ${
                  record.status === 'removed' ? 'bg-red-50/30' :
                  record.status === 'added' ? 'bg-accent-50/30' :
                  record.status === 'modified' ? 'bg-amber-50/30' : ''
                }`}
              >
                <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">
                  {record.key}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${STATUS_CONFIG[record.status].className}`}>
                    {STATUS_CONFIG[record.status].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {record.changedFields && record.changedFields.length > 0
                    ? record.changedFields.join(', ')
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}–{Math.min(startIndex + rowsPerPage, filteredRecords.length)} of {filteredRecords.length}
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

export default ResultsTable
