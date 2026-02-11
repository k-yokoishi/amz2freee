import type { CsvRow } from '@/features/_shared/types'
import { normalizeSearchText } from '@/features/selection/normalizeSearchText'
import { safeDate } from '@/features/selection/safeDate'

export function filterRows(rows: CsvRow[], selectedYear: string, query: string): CsvRow[] {
  const normalizedQuery = normalizeSearchText(query.trim())
  let nextRows = rows.filter((row) =>
    Object.values(row.value).some((value) => normalizeSearchText(value ?? '').includes(normalizedQuery)),
  )

  if (selectedYear !== 'all') {
    nextRows = nextRows.filter((row) => {
      const date = safeDate(row.value['Order Date'])
      return date ? String(date.getFullYear()) === selectedYear : false
    })
  }

  return nextRows
}
