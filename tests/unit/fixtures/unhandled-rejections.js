import process from 'node:process'

// Vitest fails the run on any unhandled rejection: take its listeners over
// while a test expects one.
export const recordUnhandledRejections = async run => {
  const vitestListeners = process.listeners('unhandledRejection')
  process.removeAllListeners('unhandledRejection')
  const rejections = []
  process.on('unhandledRejection', reason => rejections.push(reason))
  try {
    await run()
    await new Promise(resolve => setTimeout(resolve))
  } finally {
    process.removeAllListeners('unhandledRejection')
    vitestListeners.forEach(listener =>
      process.on('unhandledRejection', listener)
    )
  }
  return rejections
}
