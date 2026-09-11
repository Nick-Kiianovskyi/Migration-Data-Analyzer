import type { KeyFieldSelectorProps } from './KeyFieldSelector.tsx.types'

function KeyFieldSelector({ commonColumns, selectedKey, onSelect, disabled = false }: KeyFieldSelectorProps) {
  if (commonColumns.length === 0) {
    return null
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Key Field Selection</h3>
          <p className="text-sm text-gray-500">Select a unique identifier for record matching</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {commonColumns.map((column) => (
          <button
            key={column}
            onClick={() => onSelect(column)}
            disabled={disabled}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium text-left
              transition-all duration-150
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${selectedKey === column
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {selectedKey === column && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {column}
            </span>
          </button>
        ))}
      </div>

      {selectedKey && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
          <p className="text-sm text-primary-700">
            <span className="font-semibold">Selected:</span> {selectedKey}
          </p>
        </div>
      )}
    </div>
  )
}

export default KeyFieldSelector
