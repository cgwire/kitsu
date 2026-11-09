// @vitest-environment node
import { afterAll, describe, expect, it, vi } from 'vitest'

import '@/polyfills'

// A browser without structuredClone or toSorted, like Safari 14: vi.hoisted
// removes them before the import above runs.
const nativeStructuredClone = vi.hoisted(() => {
  const native = globalThis.structuredClone
  delete globalThis.structuredClone
  return native
})
const nativeToSorted = vi.hoisted(() => {
  const native = Array.prototype.toSorted
  delete Array.prototype.toSorted
  return native
})

describe('polyfills without a native structuredClone', () => {
  afterAll(() => {
    globalThis.structuredClone = nativeStructuredClone
  })

  it('installs a structuredClone', () => {
    const date = new Date('2026-10-22T08:00:00Z')
    const value = {
      date,
      map: new Map([['key', [1, 2]]]),
      set: new Set(['item'])
    }
    value.itself = value

    const clone = globalThis.structuredClone(value)

    expect(globalThis.structuredClone).not.toBe(nativeStructuredClone)
    expect(clone).not.toBe(value)
    expect(clone.date).not.toBe(date)
    expect(clone.date.getTime()).toBe(date.getTime())
    expect(clone.map).toEqual(value.map)
    expect(clone.set).toEqual(value.set)
    expect(clone.itself).toBe(clone)
  })
})

describe('polyfills without a native toSorted', () => {
  afterAll(() => {
    Array.prototype.toSorted = nativeToSorted
  })

  it('installs a toSorted that leaves the array as it is', () => {
    const list = [3, 1, 2]

    expect(Array.prototype.toSorted).not.toBe(nativeToSorted)
    expect(list.toSorted((a, b) => a - b)).toEqual([1, 2, 3])
    expect(list).toEqual([3, 1, 2])
  })
})
