export default {
  runPromiseMapAsSeries(array, promise) {
    return array.reduce((accumulatorPromise, item) => {
      return accumulatorPromise.then(() => promise(item))
    }, Promise.resolve())
  },

  // Sends one value at a time: a value given during a send waits for it, and
  // only the last of the waiting values is sent then, even after a failed
  // send. Every call settles once nothing is left to send, and rejects with
  // the first send that failed.
  queueLatest(send) {
    let isPending = false
    let pendingValue = null
    let sending = null
    const sendPending = async () => {
      const errors = []
      try {
        while (isPending) {
          const value = pendingValue
          isPending = false
          // A send that throws at once must fail after the call that started
          // the loop has kept its promise: the loop would never restart.
          await new Promise(resolve => resolve(send(value))).catch(err => {
            errors.push(err)
          })
        }
      } finally {
        sending = null
      }
      if (errors.length > 0) throw errors[0]
    }
    return value => {
      pendingValue = value
      isPending = true
      sending ||= sendPending()
      return sending
    }
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
