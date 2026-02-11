import type { CsvRow } from '@/features/_shared/types'
import { normalizeRows } from '@/features/_shared/utils/normalizeRows'

export function parseAmazonRows(rows: Record<string, string>[]): CsvRow[] {
  return normalizeRows(rows)
}
