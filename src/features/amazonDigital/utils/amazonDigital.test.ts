import { parseAmazonDigitalFiles } from '@/features/amazonDigital/utils/parseAmazonDigitalFiles'
import { parseAmazonDigitalRows } from '@/features/amazonDigital/utils/parseAmazonDigitalRows'
import { requiredColumnsForAmazonDigital } from '@/features/amazonDigital/utils/requiredColumnsForAmazonDigital'

function toFileList(files: File[]): FileList {
  const dt = new DataTransfer()
  files.forEach((file) => dt.items.add(file))
  return dt.files
}

describe('amazon digital utils', () => {
  it('requiredColumnsForAmazonDigital returns expected columns', () => {
    expect(requiredColumnsForAmazonDigital()).toEqual(['OrderId', 'OrderDate', 'ProductName', 'OurPrice'])
  })

  it('parseAmazonDigitalRows maps and normalizes numbers', () => {
    const rows = parseAmazonDigitalRows([
      {
        OrderId: 'D-1',
        OrderDate: '2025/01/01',
        ProductName: 'Kindle Book',
        OurPrice: '980.2',
        OurPriceTax: '1078.9',
      },
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0]?.value['Order ID']).toBe('D-1')
    expect(rows[0]?.value['Total Owed']).toBe('1078')
    expect(rows[0]?.value['Shipment Item Subtotal Tax']).toBe('98')
  })

  it('parseAmazonDigitalFiles resolves parsed upload', async () => {
    const file = new File(
      ['OrderId,OrderDate,ProductName,OurPrice\nD-1,2025/01/01,Book,100\n'],
      'digital.csv',
      { type: 'text/csv' },
    )
    const uploads = await parseAmazonDigitalFiles(toFileList([file]))
    expect(uploads[0]?.name).toBe('digital.csv')
    expect(uploads[0]?.rows).toHaveLength(1)
  })
})
