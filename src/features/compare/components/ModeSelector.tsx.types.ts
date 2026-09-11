import type { AnalysisMode } from '@shared/types'

export interface ModeSelectorProps {
  mode: AnalysisMode
  onSelect: (mode: AnalysisMode) => void
  disabled?: boolean
}
