import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import type { CsvRow } from '@/features/_shared/types'
import SelectStep from '@/app/_components/SelectStep'

const rows: CsvRow[] = [
  {
    id: '1',
    value: {
      'Order Date': '2025/01/10',
      'Order ID': 'A-001',
      'Product Name': 'Book',
      Quantity: '1',
      'Total Owed': '1000',
      Currency: 'JPY',
      'Payment Instrument Type': 'VISA',
      'Shipment Status': 'Shipped',
    },
  },
]

function Harness() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  return (
    <SelectStep
      step={2}
      handleStepClick={() => {}}
      rows={rows}
      selectedKeys={selectedKeys}
      setSelectedKeys={setSelectedKeys}
      onGoToExport={() => {}}
    />
  )
}

describe('SelectStep', () => {
  it('toggles row selection by row click', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getByText('0/1選択中')).toBeTruthy()
    await user.click(screen.getByText('A-001'))
    expect(screen.getByText('1/1選択中')).toBeTruthy()
  })
})
