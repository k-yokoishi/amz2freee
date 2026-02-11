import type { CsvRow, RowOverrides } from '@/features/_shared/types'
import { buildFreeeCsv } from '@/features/freee/utils/buildFreeeCsv'
import { buildFreeeRow } from '@/features/freee/utils/buildFreeeRow'
import { getFreeeHeaders } from '@/features/freee/utils/getFreeeHeaders'
import { inferTaxCategory } from '@/features/freee/utils/inferTaxCategory'
import { safeDate } from '@/features/freee/utils/safeDate'

const baseRow: CsvRow = {
  id: 'r1',
  value: {
    'Order Date': '2025/01/10',
    'Ship Date': '2025/01/11',
    'Product Name': 'Test "Book"',
    Quantity: '2',
    'Total Owed': '1,999.9',
    'Shipment Item Subtotal': '1800',
    'Shipment Item Subtotal Tax': '180',
    'Unit Price': '900',
    'Unit Price Tax': '90',
  },
}

describe('freee utils', () => {
  it('safeDate parses valid and invalid strings', () => {
    expect(safeDate('2025/01/01')).not.toBeNull()
    expect(safeDate('x')).toBeNull()
  })

  it('returns expected header count', () => {
    expect(getFreeeHeaders()).toHaveLength(21)
  })

  it('infers tax category from tax rate', () => {
    expect(inferTaxCategory(baseRow)).toBe('課対仕入10%')
    expect(
      inferTaxCategory({
        ...baseRow,
        value: {
          ...baseRow.value,
          'Shipment Item Subtotal': '1000',
          'Shipment Item Subtotal Tax': '80',
        },
      }),
    ).toBe('課対仕入8%（軽）')
  })

  it('buildFreeeRow normalizes integer amount and applies overrides', () => {
    const overrides: RowOverrides = {
      r1: { accountTitle: '消耗品費' },
    }
    const row = buildFreeeRow(baseRow, {
      taxCategory: '課対仕入10%',
      settlementBase: 'order',
      overrides,
      sourceType: 'amazon',
    })
    expect(row[6]).toBe('消耗品費')
    expect(row[8]).toBe('1999')
    expect(row[9]).toBe('内税')
    expect(row[10]).toBe('180')
  })

  it('buildFreeeCsv escapes cells with quotes and commas', () => {
    const csv = buildFreeeCsv([baseRow], {
      taxCategory: '課対仕入10%',
      settlementBase: 'order',
      overrides: {},
      sourceType: 'amazon',
    })
    expect(csv.split('\n')).toHaveLength(2)
    expect(csv).toContain('収支区分')
    expect(csv).toContain('"Test ""Book"""')
  })
})
