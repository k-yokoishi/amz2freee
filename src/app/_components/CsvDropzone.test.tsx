import { fireEvent, render } from '@testing-library/react'
import CsvDropzone from '@/app/_components/CsvDropzone'

describe('CsvDropzone', () => {
  it('passes selected files to onFiles', () => {
    const onFiles = vi.fn()
    const { container } = render(<CsvDropzone maxFiles={1} onFiles={onFiles} error={null} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const dt = new DataTransfer()
    dt.items.add(new File(['a'], 'a.csv', { type: 'text/csv' }))
    dt.items.add(new File(['b'], 'b.csv', { type: 'text/csv' }))
    fireEvent.change(input, { target: { files: dt.files } })
    const passed = onFiles.mock.calls[0]?.[0] as FileList
    expect(passed.length).toBe(1)
    expect(passed[0]?.name).toBe('a.csv')
  })
})
