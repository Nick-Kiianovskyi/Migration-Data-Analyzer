import type { ComparisonResult } from '../../../shared/types'

export interface ResultsSummaryProps {
  summary: ComparisonResult['summary']
}

export interface ResultsTableProps {
  records: ComparisonResult['records']
  keyField: string
}
