import Papa from 'papaparse'
import type { ParsedUpload, SourceFilesParser } from '@/features/_shared/types'
import { normalizeRows } from '@/features/_shared/utils/normalizeRows'
import { parseOricoRows } from '@/features/orico/utils/parseOricoRows'

export const parseOricoFiles: SourceFilesParser = async (files) => {
  const uploads: ParsedUpload[] = []
  for (const file of Array.from(files)) {
    const buffer = await file.arrayBuffer()
    const text = new TextDecoder('shift_jis').decode(buffer)
    const parsedCsv = Papa.parse<string[]>(text, { skipEmptyLines: true })
    const rows = normalizeRows(parseOricoRows(parsedCsv.data as string[][]))
    uploads.push({
      name: file.name,
      rows,
      fields: Object.keys(rows[0]?.value ?? {}),
    })
  }
  return uploads
}
