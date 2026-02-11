import { normalizeRows } from '@/features/_shared/utils/normalizeRows'

describe('normalizeRows', () => {
  it('keeps already normalized rows', () => {
    const rows = [{ id: 'a', value: { foo: 'bar' } }]
    expect(normalizeRows(rows)).toEqual(rows)
  })

  it('adds id for plain record rows', () => {
    const rows = [{ foo: 'bar' }]
    const normalized = normalizeRows(rows)
    expect(normalized).toHaveLength(1)
    expect(normalized[0]?.id).toBeTypeOf('string')
    expect(normalized[0]?.value).toEqual({ foo: 'bar' })
  })
})
