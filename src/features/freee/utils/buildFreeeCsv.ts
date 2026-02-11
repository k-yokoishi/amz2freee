import type { CsvRow, RowOverrides, SourceType } from '@/features/_shared/types'
import { buildFreeeRow } from '@/features/freee/utils/buildFreeeRow'
import { getFreeeHeaders } from '@/features/freee/utils/getFreeeHeaders'

export function buildFreeeCsv(
  rows: CsvRow[],
  options: {
    taxCategory: string
    settlementBase: 'order' | 'ship'
    overrides: RowOverrides
    sourceType: SourceType
  },
): string {
  const escapeCsvCell = (value: string): string => {
    if (value.includes('"') || value.includes(',') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const lines: string[][] = [getFreeeHeaders()]
  for (const row of rows) {
    lines.push(buildFreeeRow(row, options))
  }
  return lines.map((line) => line.map((cell) => escapeCsvCell(String(cell))).join(',')).join('\n')
}
