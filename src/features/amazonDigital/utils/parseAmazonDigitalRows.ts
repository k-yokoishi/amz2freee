import type { CsvRow } from '@/features/_shared/types'

export function parseAmazonDigitalRows(rows: Record<string, string>[]): CsvRow[] {
  return rows.map((row) => {
    const parseNumber = (value: string | undefined): number | null => {
      if (!value) return null
      const normalized = value.replace(/,/g, '')
      const num = Number(normalized)
      return Number.isNaN(num) ? null : num
    }

    const total = row['OurPriceTax'] || row['OurPrice'] || ''
    const base = row['OurPrice'] || ''
    const totalNum = parseNumber(total)
    const baseNum = parseNumber(base)
    const taxNum =
      totalNum !== null && baseNum !== null ? Math.max(totalNum - baseNum, 0) : null
    const taxAmount = taxNum !== null ? String(taxNum) : ''
    const normalizedTotal = totalNum !== null ? String(Math.floor(totalNum)) : total
    const normalizedBase = baseNum !== null ? String(Math.floor(baseNum)) : base
    const normalizedTaxAmount = taxNum !== null ? String(Math.floor(taxNum)) : taxAmount

    return {
      id: crypto.randomUUID(),
      value: {
        Website: row['Marketplace'] || 'Amazon',
        'Order ID': row['OrderId'] || '',
        'Order Date': row['OrderDate'] || '',
        'Ship Date': row['FulfilledDate'] || row['OrderDate'] || '',
        'Product Name': row['ProductName'] || '',
        Quantity: row['QuantityOrdered'] || row['OriginalQuantity'] || '1',
        Currency: row['OurPriceCurrencyCode'] || row['BaseCurrencyCode'] || 'JPY',
        'Total Owed': normalizedTotal,
        'Unit Price': normalizedBase,
        'Shipment Item Subtotal': normalizedBase,
        'Shipment Item Subtotal Tax': normalizedTaxAmount,
        'Unit Price Tax': normalizedTaxAmount,
        'Payment Instrument Type': 'Amazon Digital',
        'Order Status': row['IsFulfilled'] || '',
        'Shipment Status': row['ItemFulfilled'] || '',
        ASIN: row['ASIN'] || '',
      },
    }
  })
}
