export default {
  runPromiseMapAsSeries(array, promise) {
    return array.reduce((accumulatorPromise, item) => {
      return accumulatorPromise.then(() => promise(item))
    }, Promise.resolve())
  },

  debounce(fn, delay) {
    let timeout = null
    const debounced = function (...args) {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn.apply(this, args), delay)
    }
    debounced.cancel = () => clearTimeout(timeout)
    return debounced
  }
}
