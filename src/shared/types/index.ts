export interface ParsedFile {
  file: File
  name: string
  size: number
  rowCount: number
  columns: string[]
  data: Record<string, string>[]
}

export interface UploadState {
  beforeFile: ParsedFile | null
  afterFile: ParsedFile | null
  isLoading: boolean
  error: string | null
}

export type RecordStatus = 'added' | 'removed' | 'modified' | 'unchanged'

export interface FieldChange {
  fieldName: string
  oldValue: string
  newValue: string
}

export interface ComparedRecord {
  key: string
  status: RecordStatus
  before: Record<string, string> | null
  after: Record<string, string> | null
  changedFields?: string[]
  fieldChanges?: FieldChange[]
}

export interface ComparisonResult {
  keyField: string
  beforeFileName: string
  afterFileName: string
  timestamp: string
  summary: {
    totalBefore: number
    totalAfter: number
    added: number
    removed: number
    matching: number
    modified: number
    totalFieldChanges: number
  }
  records: ComparedRecord[]
}

export type AnalysisMode = 'keyField' | 'full'

export type CellStatus = 'equal' | 'changed' | 'missing'

export interface CellComparison {
  row: number
  column: string
  oldValue: string
  newValue: string
  status: CellStatus
}

export interface FullComparisonResult {
  beforeFileName: string
  afterFileName: string
  timestamp: string
  columns: string[]
  totalCells: number
  equalCells: number
  changedCells: number
  missingCells: number
  cells: CellComparison[]
}
