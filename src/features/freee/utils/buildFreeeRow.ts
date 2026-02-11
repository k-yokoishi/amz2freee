import type { CsvRow, RowOverrides, SourceType } from '@/features/_shared/types'
import { safeDate } from '@/features/freee/utils/safeDate'

export function buildFreeeRow(
  row: CsvRow,
  options: {
    taxCategory: string
    settlementBase: 'order' | 'ship'
    overrides: RowOverrides
    sourceType: SourceType
  },
): string[] {
  const parseNumber = (value: string | undefined): number | null => {
    if (!value) return null
    const normalized = value.replace(/,/g, '')
    const num = Number(normalized)
    return Number.isNaN(num) ? null : num
  }

  const normalizeIntegerAmount = (value: string | undefined): string => {
    if (!value) return ''
    const num = parseNumber(value)
    if (num === null) return value
    return String(Math.floor(num))
  }

  const formatJstDate = (value: string | undefined): string => {
    if (!value) return ''
    const date = safeDate(value)
    if (!date) return ''
    const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000)
    const yyyy = jst.getUTCFullYear()
    const mm = String(jst.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(jst.getUTCDate()).padStart(2, '0')
    return `${yyyy}/${mm}/${dd}`
  }

  const calcTaxAmount = (): string => {
    const direct = row.value['Shipment Item Subtotal Tax'] ?? ''
    if (direct) return direct
    const unitTax = parseNumber(row.value['Unit Price Tax'])
    const quantity = parseNumber(row.value['Quantity'])
    if (unitTax === null || quantity === null) return ''
    const total = unitTax * quantity
    return Number.isInteger(total) ? String(total) : total.toFixed(2)
  }

  const normalizeOverride = (value: string | undefined): string | undefined => {
    if (!value) return undefined
    const trimmed = value.trim()
    return trimmed ? trimmed : undefined
  }

  const dateValue =
    options.settlementBase === 'ship' ? row.value['Ship Date'] : row.value['Order Date']
  const productName = row.value['Product Name'] ?? ''
  const amount = normalizeIntegerAmount(row.value['Total Owed'])
  const override = options.overrides[row.id] ?? {}
  const isDigital = options.sourceType === 'amazon_digital'
  const accountTitle = normalizeOverride(override.accountTitle) ?? (isDigital ? '新聞図書費' : '')
  const taxCategory = '課対仕入10%'
  const formattedDate = formatJstDate(dateValue)

  return [
    '支出',
    '',
    formattedDate,
    '',
    '',
    '',
    accountTitle,
    taxCategory,
    amount,
    '内税',
    calcTaxAmount(),
    productName,
    '',
    '',
    '',
    '',
    '',
    '',
    formattedDate,
    '現金',
    amount,
  ]
}
