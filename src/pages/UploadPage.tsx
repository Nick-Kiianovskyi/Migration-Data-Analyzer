import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from '@features/upload'
import { CompareButton, KeyFieldSelector, ModeSelector } from '@features/compare'
import { useFileParser } from '@shared/hooks'
import { compareWithBestEngine } from '@shared/engines'
import type { ParsedFile, AnalysisMode } from '@shared/types'

function UploadPage() {
  const navigate = useNavigate()
  const { parseFile, error, clearError } = useFileParser()

  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('keyField')
  const [beforeFile, setBeforeFile] = useState<ParsedFile | null>(null)
  const [afterFile, setAfterFile] = useState<ParsedFile | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [isLoadingBefore, setIsLoadingBefore] = useState(false)
  const [isLoadingAfter, setIsLoadingAfter] = useState(false)
  const [isComparing, setIsComparing] = useState(false)

  const isLoading = isLoadingBefore || isLoadingAfter

  const commonColumns = useMemo(() => {
    if (!beforeFile || !afterFile) return []
    const beforeSet = new Set(beforeFile.columns)
    return afterFile.columns.filter((col) => beforeSet.has(col))
  }, [beforeFile, afterFile])

  const canCompare =
    beforeFile !== null &&
    afterFile !== null &&
    !isLoading &&
    (analysisMode === 'full' || selectedKey !== null)

  const handleBeforeFileSelect = async (file: File) => {
    clearError()
    setSelectedKey(null)
    setIsLoadingBefore(true)
    const parsed = await parseFile(file)
    setBeforeFile(parsed)
    setIsLoadingBefore(false)
  }

  const handleAfterFileSelect = async (file: File) => {
    clearError()
    setSelectedKey(null)
    setIsLoadingAfter(true)
    const parsed = await parseFile(file)
    setAfterFile(parsed)
    setIsLoadingAfter(false)
  }

  const handleKeySelect = (key: string) => {
    setSelectedKey(key)
  }

  const handleCompare = async () => {
    if (!canCompare || !beforeFile || !afterFile) return

    const keyField =
      analysisMode === 'full'
        ? commonColumns[0] || beforeFile.columns[0]
        : selectedKey!
    if (!keyField) return

    setIsComparing(true)

    try {
      const { result, engine } = await compareWithBestEngine(
        beforeFile,
        afterFile,
        keyField
      )

      navigate('/results', {
        state: {
          mode: analysisMode,
          result,
          engine,
          beforeFile: { name: beforeFile.name, size: beforeFile.size, rowCount: beforeFile.rowCount, columns: beforeFile.columns, data: beforeFile.data },
          afterFile: { name: afterFile.name, size: afterFile.size, rowCount: afterFile.rowCount, columns: afterFile.columns, data: afterFile.data },
        },
      })
    } catch (err) {
      console.error('[Comparison] Failed:', err)
    } finally {
      setIsComparing(false)
    }
  }

  const showKeySelector =
    analysisMode === 'keyField' && beforeFile !== null && afterFile !== null && !isLoading

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Data Upload
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your pre-migration and post-migration data files for comparative analysis.
          CSV and Excel formats are supported.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <div className="p-1 rounded bg-red-100 text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <ModeSelector
        mode={analysisMode}
        onSelect={setAnalysisMode}
        disabled={isLoading || isComparing}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <FileUpload
            label="Pre-Migration File"
            onFileSelect={handleBeforeFileSelect}
            parsedFile={beforeFile}
            isLoading={isLoadingBefore}
            disabled={isLoading}
          />
        </div>

        <div className="card">
          <FileUpload
            label="Post-Migration File"
            onFileSelect={handleAfterFileSelect}
            parsedFile={afterFile}
            isLoading={isLoadingAfter}
            disabled={isLoading}
          />
        </div>
      </div>

      {showKeySelector && (
        <KeyFieldSelector
          commonColumns={commonColumns}
          selectedKey={selectedKey}
          onSelect={handleKeySelect}
          disabled={isLoading}
        />
      )}

      <div className="flex flex-col items-center gap-4">
        <CompareButton
          onClick={handleCompare}
          disabled={!canCompare}
          isLoading={isComparing}
        />

        {!canCompare && !isLoading && (
          <p className="text-sm text-gray-500">
            {beforeFile && afterFile && analysisMode === 'keyField' && !selectedKey
              ? 'Select a key field to start comparison'
              : 'Upload both files to start comparison'}
          </p>
        )}
      </div>

      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-100">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">How it works</h3>
            <p className="text-sm text-gray-600 mt-1">
              The system automatically compares the structure and data of both files,
              identifying added, removed, and modified records. Results are presented
              in a clear format with detailed statistics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadPage
