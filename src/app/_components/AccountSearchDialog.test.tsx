import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountSearchDialog from '@/app/_components/AccountSearchDialog'

describe('AccountSearchDialog', () => {
  it('filters candidates and selects account', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <AccountSearchDialog
        open
        onOpenChange={() => {}}
        items={[
          { small: '消耗品', account: '消耗品費' },
          { small: '交通', account: '旅費交通費' },
        ]}
        onSelect={onSelect}
      />,
    )

    await user.type(screen.getByPlaceholderText('小分類 / 勘定科目で検索'), '旅費')
    await user.click(screen.getByRole('button', { name: /旅費交通費/ }))
    expect(onSelect).toHaveBeenCalledWith('旅費交通費')
  })
})
