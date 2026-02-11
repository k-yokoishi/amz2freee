import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CsvRow, RowOverrides } from '@/features/_shared/types'
import ExportStep from '@/app/_components/ExportStep'

const row: CsvRow = {
  id: '1',
  value: {
    'Order Date': '2025/01/10',
    'Product Name': 'Book',
    'Total Owed': '1000',
    Quantity: '1',
  },
}

const headers = [
  '収支区分',
  '管理番号',
  '発生日',
  '決済期日',
  '取引先コード',
  '取引先',
  '勘定科目',
  '税区分',
  '金額',
  '税計算区分',
  '税額',
  '備考',
  '品目',
  '部門',
  'メモタグ（複数指定可、カンマ区切り）',
  'セグメント1',
  'セグメント2',
  'セグメント3',
  '決済日',
  '決済口座',
  '決済金額',
]

describe('ExportStep', () => {
  it('renders and calls export action', async () => {
    const user = userEvent.setup()
    const onExport = vi.fn()
    const onOverride = vi.fn()
    const buildFreeeRow = () =>
      ['支出', '', '2025/01/10', '', '', '', '', '課対仕入10%', '1000', '内税', '', 'Book', '', '', '', '', '', '', '', '現金', '1000']

    render(
      <ExportStep
        step={3}
        handleStepClick={() => {}}
        taxCategory="課対仕入10%"
        settlementBase="order"
        sourceType="amazon"
        selectedRows={[row]}
        rowOverrides={{} as RowOverrides}
        handleOverrideChange={onOverride}
        handleExportCsv={onExport}
        buildFreeeRow={buildFreeeRow}
        inferTaxCategory={() => '課対仕入10%'}
        FREEE_HEADERS={headers}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'CSVをエクスポート' }))
    expect(onExport).toHaveBeenCalledTimes(1)
  })
})
