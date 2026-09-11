import type { ResultsSummaryProps } from './ResultsPage.tsx.types'

function ResultsSummary({ summary }: ResultsSummaryProps) {
  const stats = [
    {
      label: 'Total Before',
      value: summary.totalBefore,
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      iconColor: 'text-gray-500',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      ),
    },
    {
      label: 'Total After',
      value: summary.totalAfter,
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      iconColor: 'text-gray-500',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      ),
    },
    {
      label: 'Added',
      value: summary.added,
      color: 'bg-accent-50 text-accent-700 border-accent-200',
      iconColor: 'text-accent-500',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      ),
    },
    {
      label: 'Removed',
      value: summary.removed,
      color: 'bg-red-50 text-red-700 border-red-200',
      iconColor: 'text-red-500',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 12H4"
        />
      ),
    },
    {
      label: 'Modified',
      value: summary.modified,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      iconColor: 'text-amber-500',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      ),
    },
    {
      label: 'Unchanged',
      value: summary.matching,
      color: 'bg-primary-50 text-primary-700 border-primary-200',
      iconColor: 'text-primary-500',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      ),
    },
    {
      label: 'Field Changes',
      value: summary.totalFieldChanges,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      iconColor: 'text-purple-500',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-xl border p-4 ${stat.color}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/50 ${stat.iconColor}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {stat.icon}
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium opacity-75">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ResultsSummary
