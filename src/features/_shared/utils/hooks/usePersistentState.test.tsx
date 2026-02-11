import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePersistentState } from '@/features/_shared/utils/hooks/usePersistentState'

function HookHarness() {
  const [value, setValue] = usePersistentState('test:key', 'init')
  return (
    <div>
      <span>{value}</span>
      <button type="button" onClick={() => setValue('next')}>
        set
      </button>
    </div>
  )
}

describe('usePersistentState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reads value from localStorage and writes updates', async () => {
    localStorage.setItem('test:key', JSON.stringify('stored'))
    const user = userEvent.setup()
    render(<HookHarness />)

    expect(screen.getByText('stored')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'set' }))
    expect(localStorage.getItem('test:key')).toBe(JSON.stringify('next'))
  })
})
