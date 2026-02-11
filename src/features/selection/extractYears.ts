import type { CsvRow } from '@/features/_shared/types'
import { safeDate } from '@/features/selection/safeDate'

export function extractYears(rows: CsvRow[]): string[] {
  const set = new Set<string>()
  for (const row of rows) {
    const date = safeDate(row.value['Order Date'])
    if (date) set.add(String(date.getFullYear()))
  }
  return Array.from(set).sort((a, b) => Number(b) - Number(a))
}
