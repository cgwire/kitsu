// @vitest-environment node

import func from '@/lib/func'

describe('func', () => {
  test('runPromiseMapAsSeries', async () => {
    let counter = 0
    const mapFunc = (item) => {
      counter += item
      return Promise.resolve(item)
    }
    await func.runPromiseMapAsSeries([1, 5], mapFunc)
    expect(counter).toEqual(6)
  })

  test('throttle', () => {
    let count = 0
    const fn = func.throttle(() => { count++ }, 100)
    fn()
    expect(count).toBe(1)
    fn()
    expect(count).toBe(1) // throttled
  })

  test('runPromiseMapAsSeries starts a call only after the previous one', async () => {
    const order = []
    await func.runPromiseMapAsSeries([1, 2], item => {
      order.push(`start-${item}`)
      return Promise.resolve().then(() => order.push(`end-${item}`))
    })
    expect(order).toEqual(['start-1', 'end-1', 'start-2', 'end-2'])
  })
})
