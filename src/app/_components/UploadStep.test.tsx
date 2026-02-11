import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadStep from '@/app/_components/UploadStep'

describe('UploadStep', () => {
  it('shows uploaded files and enables confirm button for jcb', async () => {
    const user = userEvent.setup()
    const onConfirmUpload = vi.fn()
    render(
      <UploadStep
        step={1}
        handleStepClick={() => {}}
        sourceType="jcb"
        onSourceTypeChange={() => {}}
        handleFiles={() => {}}
        error={null}
        uploadedFiles={['a.csv']}
        onConfirmUpload={onConfirmUpload}
      />,
    )

    expect(screen.getByText('a.csv')).toBeTruthy()
    const button = screen.getByRole('button', { name: '確定して次へ' })
    expect(button).toBeTruthy()
    await user.click(button)
    expect(onConfirmUpload).toHaveBeenCalledTimes(1)
  })
})
