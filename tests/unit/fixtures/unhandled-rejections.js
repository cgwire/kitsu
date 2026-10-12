import process from 'node:process'

// Taken before a test fakes the timers, whose clock would hold the last wait.
const realSetTimeout = globalThis.setTimeout

// Vitest fails the run on any unhandled rejection: take its listeners over
// while a test expects one.
export const recordUnhandledRejections = async run => {
  const vitestListeners = process.listeners('unhandledRejection')
  process.removeAllListeners('unhandledRejection')
  const rejections = []
  process.on('unhandledRejection', reason => rejections.push(reason))
  try {
    await run()
    await new Promise(resolve => realSetTimeout(resolve))
  } finally {
    process.removeAllListeners('unhandledRejection')
    vitestListeners.forEach(listener =>
      process.on('unhandledRejection', listener)
    )
  }
  return rejections
}
