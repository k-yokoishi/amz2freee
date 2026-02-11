import { parseJcbFiles } from '@/features/jcb/utils/parseJcbFiles'
import { parseJcbRows } from '@/features/jcb/utils/parseJcbRows'

function toFileList(files: File[]): FileList {
  const dt = new DataTransfer()
  files.forEach((file) => dt.items.add(file))
  return dt.files
}

describe('jcb utils', () => {
  it('parseJcbRows extracts valid transaction rows only', () => {
    const rows = parseJcbRows([
      ['dummy'],
      ['ご利用日', 'ご利用先など', 'お支払い金額(￥)'],
      ['2025/01/01', 'Store A', '1000'],
      ['【集計】', '', ''],
      ['', '', ''],
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0]?.value['Product Name']).toBe('Store A')
    expect(rows[0]?.value['Total Owed']).toBe('1000')
  })

  it('parseJcbFiles parses multiple files', async () => {
    const file1 = new File(['a,b,c\n1,2,3\n'], 'jcb1.csv')
    const file2 = new File(['a,b,c\n1,2,3\n'], 'jcb2.csv')
    const uploads = await parseJcbFiles(toFileList([file1, file2]))
    expect(uploads).toHaveLength(2)
    expect(uploads[0]?.name).toBe('jcb1.csv')
    expect(Array.isArray(uploads[0]?.rows)).toBe(true)
  })
})
