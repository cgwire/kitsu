// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { formatAmount, isNumberTyped } from '@/lib/number'

describe('lib/number', () => {
  it('groups thousands by clock preference', () => {
    expect(formatAmount(1234.6, true)).toBe('1,235')
    expect(formatAmount(1234.6, false)).toBe('1 235')
    expect(formatAmount(0, false)).toBe('0')
  })

  describe('isNumberTyped', () => {
    // What a number input reports for its text: "2." is no number yet.
    const field = (value, valueAsNumber = NaN) => ({ value, valueAsNumber })

    it('reads the text typed as the value it holds', () => {
      expect(isNumberTyped(field('2.0', 2), 2)).toBe(true)
      expect(isNumberTyped(field('24', 24), '24')).toBe(true)
      expect(isNumberTyped(field('2.0', 2), 3)).toBe(false)
    })

    it('reads an empty text as an empty value', () => {
      expect(isNumberTyped(field(''), null)).toBe(true)
      expect(isNumberTyped(field(''), '')).toBe(true)
      expect(isNumberTyped(field(''), 0)).toBe(false)
      expect(isNumberTyped(field('', NaN), 2)).toBe(false)
    })

    it('does not count a leading zero', () => {
      expect(isNumberTyped(field('05', 5), 5)).toBe(false)
      expect(isNumberTyped(field('0.5', 0.5), 0.5)).toBe(true)
    })
  })
})
