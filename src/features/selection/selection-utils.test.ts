import type { CsvRow } from '@/features/_shared/types'
import { countSelectedRows } from '@/features/selection/countSelectedRows'
import { extractYears } from '@/features/selection/extractYears'
import { filterRows } from '@/features/selection/filterRows'
import { normalizeSearchText } from '@/features/selection/normalizeSearchText'
import { safeDate } from '@/features/selection/safeDate'

const rows: CsvRow[] = [
  {
    id: '1',
    value: {
      'Order Date': '2025/01/10',
      'Order ID': 'A-001',
      'Product Name': 'Ａｍａｚｏｎギフトカード',
      'Payment Instrument Type': 'VISA',
      'Shipment Status': 'Shipped',
    },
  },
  {
    id: '2',
    value: {
      'Order Date': '2024/03/01',
      'Order ID': 'B-001',
      'Product Name': 'Keyboard',
      'Payment Instrument Type': 'Master',
      'Shipment Status': 'Delivered',
    },
  },
]

describe('selection utils', () => {
  it('normalizeSearchText normalizes full/half-width and lowercases', () => {
    expect(normalizeSearchText('ＡＢＣ １２3')).toBe('abc 123')
  })

  it('safeDate returns null for invalid date', () => {
    expect(safeDate('')).toBeNull()
    expect(safeDate('invalid')).toBeNull()
    expect(safeDate('2025/01/01')).not.toBeNull()
  })

  it('filterRows filters by query and year', () => {
    const filteredByQuery = filterRows(rows, 'all', 'amazon')
    expect(filteredByQuery).toHaveLength(1)
    expect(filteredByQuery[0]?.id).toBe('1')

    const filteredByYear = filterRows(rows, '2024', '')
    expect(filteredByYear).toHaveLength(1)
    expect(filteredByYear[0]?.id).toBe('2')
  })

  it('extractYears returns desc sorted years', () => {
    expect(extractYears(rows)).toEqual(['2025', '2024'])
  })

  it('countSelectedRows counts selected ids only', () => {
    expect(countSelectedRows(rows, new Set(['1', '3']))).toBe(1)
  })
})
