import type { CsvRow } from '@/features/_shared/types'

export function parseOricoRows(rows: string[][]): CsvRow[] {
  const headerIndex = rows.findIndex(
    (row) => row.includes('ご利用日') && row.includes('ご利用先など'),
  )
  if (headerIndex === -1) return []

  const normalizeOricoDate = (value: string | undefined): string => {
    if (!value) return ''
    const trimmed = value.trim()
    const match = trimmed.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/)
    if (!match) return trimmed
    const [, yyyy, mm, dd] = match
    return `${yyyy}/${mm.padStart(2, '0')}/${dd.padStart(2, '0')}`
  }

  const normalizeYenAmount = (value: string | undefined): string => {
    if (!value) return ''
    return value.replace(/[\\\\,]/g, '').trim()
  }

  const headers = rows[headerIndex]
  const dataRows = rows.slice(headerIndex + 1)
  const result: CsvRow[] = []

  for (const row of dataRows) {
    if (!row || row.length === 0) continue
    if (row[0] && row[0].startsWith('<')) continue
    const map: Record<string, string> = {}
    headers.forEach((header, index) => {
      map[header] = row[index] ?? ''
    })

    const usageDate = normalizeOricoDate(map['ご利用日'])
    const merchant = (map['ご利用先など'] ?? '').trim()
    const amount =
      normalizeYenAmount(map['当月ご請求額']) || normalizeYenAmount(map['ご利用金額']) || ''
    if (!usageDate && !merchant && !amount) continue

    result.push({
      id: crypto.randomUUID(),
      value: {
        Website: 'Orico',
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
        'Payment Instrument Type': 'Orico',
        'Order Status': '',
        'Shipment Status': '',
      },
    })
  }

  return result
}
