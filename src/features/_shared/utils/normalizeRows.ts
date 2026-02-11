import type { CsvRow } from '@/features/_shared/types'

export function normalizeRows(rows: Array<CsvRow | Record<string, string>>): CsvRow[] {
  return rows.map((row) => {
    if ((row as CsvRow).id && (row as CsvRow).value) return row as CsvRow
    return { id: crypto.randomUUID(), value: row as Record<string, string> }
  })
}
