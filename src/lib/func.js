export default {
  runPromiseMapAsSeries(array, promise) {
    return array.reduce((accumulatorPromise, item) => {
      return accumulatorPromise.then(() => promise(item))
    }, Promise.resolve())
  },

  debounce(fn, delay) {
    let timeout = null
    let pendingCall = null
    const debounced = function (...args) {
      clearTimeout(timeout)
      pendingCall = () => fn.apply(this, args)
      timeout = setTimeout(debounced.flush, delay)
    }
    debounced.cancel = () => {
      clearTimeout(timeout)
      pendingCall = null
    }
    debounced.flush = () => {
      const call = pendingCall
      debounced.cancel()
      call?.()
    }
    return debounced
  }
}
