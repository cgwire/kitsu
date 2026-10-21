// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import '@/polyfills'

// vi.hoisted runs before the import above.
const nativeStructuredClone = vi.hoisted(() => globalThis.structuredClone)

describe('polyfills', () => {
  it('keeps the native structuredClone', () => {
    expect(globalThis.structuredClone).toBe(nativeStructuredClone)
  })
})
