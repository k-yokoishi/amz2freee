import type { CsvRow } from '@/features/_shared/types'

export function inferTaxCategory(row: CsvRow): string {
  const parseNumber = (value: string | undefined): number | null => {
    if (!value) return null
    const normalized = value.replace(/,/g, '')
    const num = Number(normalized)
    return Number.isNaN(num) ? null : num
  }

  const quantity = parseNumber(row.value['Quantity']) ?? 1
  const subtotal = parseNumber(row.value['Shipment Item Subtotal'])
  const unitPrice = parseNumber(row.value['Unit Price'])
  const baseAmount =
    subtotal ?? (unitPrice !== null && quantity !== null ? unitPrice * quantity : null)

  const directTax = parseNumber(row.value['Shipment Item Subtotal Tax'])
  const unitTax = parseNumber(row.value['Unit Price Tax'])
  const taxAmount = directTax ?? (unitTax !== null && quantity !== null ? unitTax * quantity : null)

  if (!baseAmount || !taxAmount || baseAmount <= 0 || taxAmount <= 0) return '対象外'

  const rate = taxAmount / baseAmount
  if (rate >= 0.095) return '課対仕入10%'
  if (rate >= 0.075) return '課対仕入8%（軽）'
  return '課対仕入'
}
