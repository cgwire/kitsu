// @vitest-environment node

import func from '@/lib/func'

describe('func', () => {
  test('runPromiseMapAsSeries starts a call only after the previous one', async () => {
    const order = []
    await func.runPromiseMapAsSeries([1, 2], item => {
      order.push(`start-${item}`)
      return Promise.resolve().then(() => order.push(`end-${item}`))
    })
    expect(order).toEqual(['start-1', 'end-1', 'start-2', 'end-2'])
  })
})
