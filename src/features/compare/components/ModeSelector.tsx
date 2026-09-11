import type { ModeSelectorProps } from './ModeSelector.tsx.types'

const modes = [
  {
    id: 'keyField' as const,
    label: 'Key Field Analysis',
    desc: 'Compare records by a unique identifier',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    id: 'full' as const,
    label: 'Full Comparison',
    desc: 'Cell-by-cell comparison of all data',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
]

function ModeSelector({ mode, onSelect, disabled = false }: ModeSelectorProps) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Analysis Mode</h3>
          <p className="text-sm text-gray-500">Choose how to compare your files</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            disabled={disabled}
            className={`
              p-4 rounded-xl text-left transition-all duration-150 border-2
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${mode === m.id
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${mode === m.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                {m.icon}
              </div>
              <div>
                <p className={`font-semibold ${mode === m.id ? 'text-primary-700' : 'text-gray-900'}`}>
                  {m.label}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{m.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ModeSelector
