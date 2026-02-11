import { parseOricoFiles } from '@/features/orico/utils/parseOricoFiles'
import { parseOricoRows } from '@/features/orico/utils/parseOricoRows'

function toFileList(files: File[]): FileList {
  const dt = new DataTransfer()
  files.forEach((file) => dt.items.add(file))
  return dt.files
}

describe('orico utils', () => {
  it('parseOricoRows normalizes date and amount', () => {
    const rows = parseOricoRows([
      ['ご利用日', 'ご利用先など', '当月ご請求額'],
      ['2025年1月2日', 'Store', '\\1,200'],
      ['<summary>', '', ''],
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0]?.value['Order Date']).toBe('2025/01/02')
    expect(rows[0]?.value['Total Owed']).toBe('1200')
  })

  it('parseOricoFiles parses file list', async () => {
    const file = new File(['a,b,c\n1,2,3\n'], 'orico.csv')
    const uploads = await parseOricoFiles(toFileList([file]))
    expect(uploads).toHaveLength(1)
    expect(uploads[0]?.name).toBe('orico.csv')
    expect(Array.isArray(uploads[0]?.rows)).toBe(true)
  })
})
