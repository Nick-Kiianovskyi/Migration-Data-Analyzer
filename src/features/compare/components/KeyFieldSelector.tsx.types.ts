export interface KeyFieldSelectorProps {
  commonColumns: string[]
  selectedKey: string | null
  onSelect: (key: string) => void
  disabled?: boolean
}
