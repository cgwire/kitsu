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

  test('runPromiseAsSeries', async () => {
    let counter = 0
    const promises = [
      Promise.resolve().then(() => { counter += 1; return undefined }),
      Promise.resolve().then(() => { counter += 5; return undefined })
    ]
    await func.runPromiseAsSeries(promises)
    expect(counter).toEqual(6)
  })
})
