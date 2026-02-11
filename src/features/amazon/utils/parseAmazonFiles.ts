import Papa from 'papaparse'
import type { ParsedUpload, SourceFilesParser } from '@/features/_shared/types'
import { normalizeHeader } from '@/features/amazon/utils/normalizeHeader'
import { parseAmazonRows } from '@/features/amazon/utils/parseAmazonRows'
import { requiredColumnsForAmazon } from '@/features/amazon/utils/requiredColumnsForAmazon'

export const parseAmazonFiles: SourceFilesParser = async (files) => {
  const file = files[0]
  return new Promise<ParsedUpload[]>((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (result) => {
        const fields = result.meta.fields ?? []
        const missing = requiredColumnsForAmazon().filter((col) => !fields.includes(col))
        if (missing.length > 0) {
          reject(new Error(`必要な列が見つかりません: ${missing.join(', ')}`))
          return
        }

        resolve([
          {
            name: file.name,
            rows: parseAmazonRows(result.data),
            fields,
          },
        ])
      },
      error: (err) => reject(new Error(err.message)),
    })
  })
}
