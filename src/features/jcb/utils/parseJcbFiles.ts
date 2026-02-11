import Papa from 'papaparse'
import type { ParsedUpload, SourceFilesParser } from '@/features/_shared/types'
import { normalizeRows } from '@/features/_shared/utils/normalizeRows'
import { parseJcbRows } from '@/features/jcb/utils/parseJcbRows'

export const parseJcbFiles: SourceFilesParser = async (files) => {
  const uploads: ParsedUpload[] = []
  for (const file of Array.from(files)) {
    const buffer = await file.arrayBuffer()
    const text = new TextDecoder('shift_jis').decode(buffer)
    const parsedCsv = Papa.parse<string[]>(text, { skipEmptyLines: true })
    const rows = normalizeRows(parseJcbRows(parsedCsv.data as string[][]))
    uploads.push({
      name: file.name,
      rows,
      fields: Object.keys(rows[0]?.value ?? {}),
    })
  }
  return uploads
}
