import type { ParsedFile } from '../../../shared/types'

export interface FileUploadProps {
  label: string
  accept?: string
  onFileSelect: (file: File) => void
  parsedFile: ParsedFile | null
  isLoading?: boolean
  disabled?: boolean
}
