export default {
  runPromiseMapAsSeries (array, promise) {
    return array.reduce((accumulatorPromise, item) => {
      return accumulatorPromise.then(() => promise(item))
    }, Promise.resolve())
  },

  throttle (fn, delay) {
    let lastCall = 0
    return function (...args) {
      const now = (new Date()).getTime()
      if (now - lastCall < delay) return
      lastCall = now
      return fn(...args)
    }
  }
}
