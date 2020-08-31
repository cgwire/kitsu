import func from '../../../src/lib/func'

describe('func', () => {
  test('runPromiseMapAsSeries', (done) => {
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
  })
})
