import { normalizeHeader } from '@/features/amazon/utils/normalizeHeader'
import { parseAmazonFiles } from '@/features/amazon/utils/parseAmazonFiles'
import { parseAmazonRows } from '@/features/amazon/utils/parseAmazonRows'
import { requiredColumnsForAmazon } from '@/features/amazon/utils/requiredColumnsForAmazon'

function toFileList(files: File[]): FileList {
  const dt = new DataTransfer()
  files.forEach((file) => dt.items.add(file))
  return dt.files
}

describe('amazon utils', () => {
  it('normalizeHeader removes BOM and quotes', () => {
    expect(normalizeHeader('\ufeff" Order ID "')).toBe('Order ID')
  })

  it('requiredColumnsForAmazon returns expected columns', () => {
    expect(requiredColumnsForAmazon()).toEqual(['Order ID', 'Order Date', 'Product Name', 'Total Owed'])
  })

  it('parseAmazonRows returns normalized rows', () => {
    const rows = parseAmazonRows([{ 'Order ID': 'A' }])
    expect(rows).toHaveLength(1)
    expect(rows[0]?.value['Order ID']).toBe('A')
    expect(rows[0]?.id).toBeTypeOf('string')
  })

  it('parseAmazonFiles resolves parsed upload', async () => {
    const file = new File(
      ['Order ID,Order Date,Product Name,Total Owed\nA-1,2025/01/01,Book,1000\n'],
      'amazon.csv',
      { type: 'text/csv' },
    )
    const uploads = await parseAmazonFiles(toFileList([file]))
    expect(uploads).toHaveLength(1)
    expect(uploads[0]?.name).toBe('amazon.csv')
    expect(uploads[0]?.rows).toHaveLength(1)
  })

  it('parseAmazonFiles rejects when required columns are missing', async () => {
    const file = new File(['Order ID\nA-1\n'], 'amazon.csv', { type: 'text/csv' })
    await expect(parseAmazonFiles(toFileList([file]))).rejects.toThrow('必要な列が見つかりません')
  })
})
