import type { CsvRow } from '@/features/_shared/types'

export function countSelectedRows(rows: CsvRow[], selectedKeys: Set<string>): number {
  let count = 0
  for (const row of rows) {
    if (selectedKeys.has(row.id)) count += 1
  }
  return count
}
