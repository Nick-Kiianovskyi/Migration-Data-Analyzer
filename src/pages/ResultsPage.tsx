import { useState, useMemo } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import Tabs from '../components/Tabs'
import ExportButton from '../components/ExportButton'
import { ResultsSummary, RecordsTable, FieldChangesTable, FullComparisonTable } from '@features/results'
import { AnalyticsDashboard } from '@features/dashboard'
import { compareFilesFull } from '@shared/utils/cellCompare'
import type { AnalysisMode, ComparisonResult, ParsedFile } from '@shared/types'

interface RouterState {
  mode?: AnalysisMode
  result?: ComparisonResult
  engine?: string
  beforeFile?: ParsedFile
  afterFile?: ParsedFile
}

function ResultsPage() {
  const location = useLocation()
  const state = (location.state as RouterState) ?? {}
  const mode = state.mode ?? 'keyField'
  const result = state.result
  const engine = state.engine ?? 'js'
  const beforeFile = state.beforeFile ?? null
  const afterFile = state.afterFile ?? null
  const [activeTab, setActiveTab] = useState<string>(mode === 'full' ? 'full' : 'dashboard')

  if (!result) {
    return <Navigate to="/" replace />
  }

  const newRecords = useMemo(
    () => result.records.filter((r) => r.status === 'added'),
    [result.records]
  )

  const deletedRecords = useMemo(
    () => result.records.filter((r) => r.status === 'removed'),
    [result.records]
  )

  const modifiedRecords = useMemo(
    () => result.records.filter((r) => r.status === 'modified'),
    [result.records]
  )

  const fullComparison = useMemo(() => {
    if (!beforeFile || !afterFile) return null
    return compareFilesFull(beforeFile, afterFile)
  }, [beforeFile, afterFile])

  const canShowFull = fullComparison !== null

  const dashboardIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M8 17V9m4 8V5m4 12v-6" />
    </svg>
  )

  const gridIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: dashboardIcon },
    { id: 'summary', label: 'Summary' },
    { id: 'new', label: 'New Records', count: newRecords.length },
    { id: 'deleted', label: 'Deleted Records', count: deletedRecords.length },
    { id: 'changed', label: 'Changed Records', count: modifiedRecords.length },
    ...(canShowFull
      ? [{ id: 'full', label: 'Full Comparison', icon: gridIcon }]
      : []),
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Analysis Results
          </h2>
          <p className="text-gray-600 mt-1">
            {mode === 'full' ? (
              <>
                Analysis mode: <span className="font-semibold">Full Comparison</span>
              </>
            ) : (
              <>
                Key field: <span className="font-semibold">{result.keyField}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-start">
          <ExportButton result={result} fullComparison={fullComparison} />
          <Link
            to="/"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            New Analysis
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-gray-600">Before:</span>
          <span className="font-medium text-gray-900">{result.beforeFileName}</span>
        </span>
        <span className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-gray-600">After:</span>
          <span className="font-medium text-gray-900">{result.afterFileName}</span>
        </span>
        <span className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-gray-600">Engine:</span>
          <span className="font-medium text-gray-900">
            {engine === 'duckdb' ? 'DuckDB WASM' : 'JavaScript'}
          </span>
        </span>
      </div>

      <ResultsSummary summary={result.summary} />

      <div className="card p-0 overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="p-6">
          {activeTab === 'dashboard' && <AnalyticsDashboard result={result} />}

          {activeTab === 'summary' && (
            <div className="space-y-6">
              <FieldChangesTable records={result.records} keyField={result.keyField} />
              <RecordsTable
                records={modifiedRecords}
                keyField={result.keyField}
                title="Modified Records"
                showFieldChanges
              />
            </div>
          )}

          {activeTab === 'new' && (
            <RecordsTable
              records={newRecords}
              keyField={result.keyField}
              title="New Records"
            />
          )}

          {activeTab === 'deleted' && (
            <RecordsTable
              records={deletedRecords}
              keyField={result.keyField}
              title="Deleted Records"
            />
          )}

          {activeTab === 'changed' && (
            <RecordsTable
              records={modifiedRecords}
              keyField={result.keyField}
              title="Changed Records"
              showFieldChanges
            />
          )}

          {activeTab === 'full' && fullComparison && (
            <FullComparisonTable result={fullComparison} />
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
