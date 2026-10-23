// @vitest-environment node
import { isAssetReadyFor } from '@/lib/casting'

// Pipeline order of the production: layout, then animation, then lighting.
const priorities = { layout: 1, animation: 2, lighting: 3 }
const getPriority = taskTypeId => priorities[taskTypeId]
const isReady = (asset, taskTypeId = 'animation') =>
  isAssetReadyFor(asset, taskTypeId, getPriority)

describe('isAssetReadyFor', () => {
  test('is ready for the step it is delivered for', () => {
    expect(isReady({ ready_for: 'animation' })).toBe(true)
  })

  test('is ready for the steps before the one it is delivered for', () => {
    expect(isReady({ ready_for: 'lighting' })).toBe(true)
  })

  test('is not ready for the steps after the one it is delivered for', () => {
    expect(isReady({ ready_for: 'layout' })).toBe(false)
  })

  // The compact assets stream of zou writes an empty ready_for as "None".
  test('is not ready while it is delivered for nothing', () => {
    expect(isReady({ ready_for: null })).toBe(false)
    expect(isReady({ ready_for: 'None' })).toBe(false)
    expect(isReady({ ready_for: 'None' }, 'unknown')).toBe(false)
  })

  test('is not ready for a step the production does not have', () => {
    expect(isReady({ ready_for: 'unknown' })).toBe(false)
  })

  test('is never ready when canceled or unknown', () => {
    expect(isReady({ ready_for: 'lighting', canceled: true })).toBe(false)
    expect(isReady(undefined)).toBe(false)
  })
})
