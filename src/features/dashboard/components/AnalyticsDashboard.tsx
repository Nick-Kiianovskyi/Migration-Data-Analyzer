import { useMemo } from 'react'
import type { ComparisonResult } from '@shared/types'
import KpiCards from './KpiCards'
import ChangesChart from './ChangesChart'
import QualityChart from './QualityChart'
import PercentGauges from './PercentGauges'
import ErrorDistribution from './ErrorDistribution'

interface DashboardMetrics {
  added: number
  removed: number
  modified: number
  matching: number
  matched: number
  matchPercent: number
  changePercent: number
  totalFieldChanges: number
  changesData: { name: string; count: number; fill: string }[]
  qualityData: { name: string; value: number; fill: string }[]
  errorData: { name: string; value: number; fill: string }[]
  fieldBreakdown: { field: string; changes: number }[]
}

const COLOR = {
  added: '#16a34a',
  removed: '#ef4444',
  modified: '#f59e0b',
  matching: '#3b82f6',
}

function AnalyticsDashboard({ result }: { result: ComparisonResult }) {
  const metrics = useMemo<DashboardMetrics>(() => {
    const { summary } = result
    let totalFieldChanges = 0
    const changeCounts: Record<string, number> = {}
    let updated = 0
    let filled = 0
    let dataLost = 0

    for (const record of result.records) {
      if (record.status !== 'modified') continue
      const changes = record.fieldChanges ?? []
      totalFieldChanges += changes.length
      for (const change of changes) {
        changeCounts[change.fieldName] = (changeCounts[change.fieldName] ?? 0) + 1
        if (change.oldValue === '' && change.newValue !== '') filled++
        else if (change.oldValue !== '' && change.newValue === '') dataLost++
        else updated++
      }
    }

    const { added, removed, modified, matching } = summary
    const matched = modified + matching
    const matchPercent = summary.totalBefore > 0 ? (matched / summary.totalBefore) * 100 : 0
    const changePercent = matched > 0 ? (modified / matched) * 100 : 0

    const fieldBreakdown = Object.entries(changeCounts)
      .map(([field, changes]) => ({ field, changes }))
      .sort((a, b) => b.changes - a.changes)
      .slice(0, 8)

    return {
      added,
      removed,
      modified,
      matching,
      matched,
      matchPercent,
      changePercent,
      totalFieldChanges,
      changesData: [
        { name: 'Unchanged', count: matching, fill: COLOR.matching },
        { name: 'Modified', count: modified, fill: COLOR.modified },
        { name: 'Added', count: added, fill: COLOR.added },
        { name: 'Removed', count: removed, fill: COLOR.removed },
      ],
      qualityData: [
        { name: 'Unchanged', value: matching, fill: COLOR.matching },
        { name: 'Modified', value: modified, fill: COLOR.modified },
        { name: 'Added', value: added, fill: COLOR.added },
        { name: 'Removed', value: removed, fill: COLOR.removed },
      ],
      errorData: [
        { name: 'Updated', value: updated, fill: '#3b82f6' },
        { name: 'Filled', value: filled, fill: '#16a34a' },
        { name: 'Data Lost', value: dataLost, fill: '#ef4444' },
      ],
      fieldBreakdown,
    }
  }, [result])

  return (
    <div className="space-y-6">
      <KpiCards
        totalBefore={result.summary.totalBefore}
        totalAfter={result.summary.totalAfter}
        matched={metrics.matched}
        modified={metrics.modified}
        added={metrics.added}
        removed={metrics.removed}
        totalFieldChanges={metrics.totalFieldChanges}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChangesChart data={metrics.changesData} />
        <QualityChart data={metrics.qualityData} matched={metrics.matched} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PercentGauges
          matchPercent={metrics.matchPercent}
          changePercent={metrics.changePercent}
        />
        <ErrorDistribution
          errorData={metrics.errorData}
          fieldBreakdown={metrics.fieldBreakdown}
        />
      </div>
    </div>
  )
}

export default AnalyticsDashboard