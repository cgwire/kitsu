import func from '@/lib/func'

describe('func', () => {
  test('runPromiseMapAsSeries', () => new Promise((done) => {
    let counter = 0
    const mapFunc = (item) => {
      counter += item
      return Promise.resolve(item)
    }
    func.runPromiseMapAsSeries([1, 5], mapFunc)
      .then(() => {
        expect(counter).toEqual(6)
        done()
      })
  }))

  test('throttle', () => {
    let count = 0
    const fn = func.throttle(() => { count++ }, 100)
    fn()
    expect(count).toBe(1)
    fn()
    expect(count).toBe(1) // throttled
  })

  test('runPromiseAsSeries', () => new Promise((done) => {
    let counter = 0
    const promises = [
      Promise.resolve().then(() => { counter += 1 }),
      Promise.resolve().then(() => { counter += 5 })
    ]
    func.runPromiseAsSeries(promises)
      .then(() => {
        expect(counter).toEqual(6)
        done()
      })
  }))
})
