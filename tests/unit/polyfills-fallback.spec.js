// @vitest-environment node
import { afterAll, describe, expect, it, vi } from 'vitest'

import '@/polyfills'

// A browser without structuredClone, like Safari 14: vi.hoisted removes it
// before the import above runs.
const nativeStructuredClone = vi.hoisted(() => {
  const native = globalThis.structuredClone
  delete globalThis.structuredClone
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
