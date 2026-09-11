import { useState, useCallback } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { ParsedFile } from '../types'

export function useFileParser() {
  const [error, setError] = useState<string | null>(null)

  const parseCSV = useCallback(async (file: File): Promise<ParsedFile> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, string>[]
          const columns = results.meta.fields || []

          console.log('[CSV] Parsed file:', file.name)
          console.log('[CSV] Columns:', columns)
          console.log('[CSV] Row count:', data.length)
          console.log('[CSV] First 5 rows:', data.slice(0, 5))

          resolve({
            file,
            name: file.name,
            size: file.size,
            rowCount: data.length,
            columns,
            data,
          })
        },
        error: (err) => {
          reject(new Error(`CSV parsing error: ${err.message}`))
        },
      })
    })
  }, [])

  const parseXLSX = useCallback(async (file: File): Promise<ParsedFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          if (!arrayBuffer) {
            throw new Error('Failed to read file content')
          }

          const data = new Uint8Array(arrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })

          if (workbook.SheetNames.length === 0) {
            throw new Error('Excel file contains no sheets')
          }

          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]

          console.log('[XLSX] File:', file.name)
          console.log('[XLSX] Sheet names:', workbook.SheetNames)
          console.log('[XLSX] Reading sheet:', firstSheetName)

          const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
            raw: false,
            defval: '',
          })

          if (jsonData.length === 0) {
            throw new Error('Sheet is empty or contains no data')
          }

          const columns = Object.keys(jsonData[0])

          console.log('[XLSX] Columns:', columns)
          console.log('[XLSX] Row count:', jsonData.length)
          console.log('[XLSX] First 5 rows:', jsonData.slice(0, 5))

          resolve({
            file,
            name: file.name,
            size: file.size,
            rowCount: jsonData.length,
            columns,
            data: jsonData,
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          reject(new Error(`XLSX parsing error: ${message}`))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsArrayBuffer(file)
    })
  }, [])

  const parseFile = useCallback(async (file: File): Promise<ParsedFile> => {
    setError(null)

    const extension = file.name.split('.').pop()?.toLowerCase()

    if (extension === 'csv') {
      return parseCSV(file)
    }

    if (extension === 'xlsx' || extension === 'xls') {
      return parseXLSX(file)
    }

    throw new Error('Unsupported file format. Please use CSV or Excel files.')
  }, [parseCSV, parseXLSX])

  const parseFileWithErrorHandling = useCallback(async (file: File): Promise<ParsedFile | null> => {
    try {
      return await parseFile(file)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(message)
      console.error('[FileParser] Error:', message)
      return null
    }
  }, [parseFile])

  return {
    parseFile: parseFileWithErrorHandling,
    error,
    clearError: () => setError(null),
  }
}
