export function nextTaskPluginTabIndex(currentIndex, count, key) {
  if (!Number.isInteger(currentIndex) || !Number.isInteger(count) || count < 1)
    return null
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  if (key === 'ArrowRight') return (currentIndex + 1) % count
  if (key === 'ArrowLeft') return (currentIndex - 1 + count) % count
  return null
}
