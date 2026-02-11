import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home page', () => {
  it('renders upload step when no persisted csv exists', async () => {
    localStorage.clear()
    render(<Home />)
    expect(await screen.findByText('取引データアップロード')).toBeTruthy()
  })
})
