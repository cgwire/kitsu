// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { formatAmount } from '@/lib/number'

describe('lib/number', () => {
  it('groups thousands by clock preference', () => {
    expect(formatAmount(1234.6, true)).toBe('1,235')
    expect(formatAmount(1234.6, false)).toBe('1 235')
    expect(formatAmount(0, false)).toBe('0')
  })
})
