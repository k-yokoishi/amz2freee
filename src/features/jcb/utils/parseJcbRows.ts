import type { CsvRow } from '@/features/_shared/types'

export function parseJcbRows(rows: string[][]): CsvRow[] {
  const headerIndex = rows.findIndex(
    (row) => row.includes('ご利用日') && row.includes('ご利用先など'),
  )
  if (headerIndex === -1) return []

  const normalizeJcbDate = (value: string | undefined): string => {
    if (!value) return ''
    return value.trim()
  }

  const headers = rows[headerIndex]
  const dataRows = rows.slice(headerIndex + 1)
  const result: CsvRow[] = []

  for (const row of dataRows) {
    if (!row || row.length === 0) continue
    if (row[0] && row[0].startsWith('【')) continue
    const map: Record<string, string> = {}
    headers.forEach((header, index) => {
      map[header] = row[index] ?? ''
    })

    const usageDate = normalizeJcbDate(map['ご利用日'])
    const merchant = (map['ご利用先など'] ?? '').trim()
    const amount = (map['お支払い金額(￥)'] ?? map['ご利用金額(￥)'] ?? '').trim()
    if (!usageDate && !merchant && !amount) continue

    result.push({
      id: crypto.randomUUID(),
      value: {
        Website: 'MyJCB',
        'Order ID': '',
        'Order Date': usageDate,
        'Ship Date': usageDate,
        'Product Name': merchant,
        Quantity: '1',
        Currency: 'JPY',
        'Total Owed': amount,
        'Unit Price': amount,
        'Shipment Item Subtotal': amount,
        'Shipment Item Subtotal Tax': '',
        'Unit Price Tax': '',
        'Payment Instrument Type': 'JCB',
        'Order Status': '',
        'Shipment Status': '',
      },
    })
  }

  return result
}
