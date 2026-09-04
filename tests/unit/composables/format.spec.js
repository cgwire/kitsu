// @vitest-environment node

import { sanitizeInteger, sanitizeIntegerLight } from '@/composables/format'

describe('composables/format', () => {
  it('sanitizeInteger accepts typed strings', () => {
    expect(sanitizeInteger('24')).toBe(24)
    expect(sanitizeInteger('24px')).toBe(24)
    expect(sanitizeInteger('')).toBe(0)
  })

  it('sanitizeInteger accepts numbers (number TextFields emit valueAsNumber)', () => {
    expect(sanitizeInteger(24)).toBe(24)
    expect(sanitizeInteger(24.7)).toBe(24)
    expect(sanitizeInteger(NaN)).toBe(0)
    expect(sanitizeInteger(null)).toBe(0)
  })

  it('sanitizeIntegerLight returns null when empty or invalid', () => {
    expect(sanitizeIntegerLight('86')).toBe(86)
    expect(sanitizeIntegerLight(86)).toBe(86)
    expect(sanitizeIntegerLight('')).toBe(null)
    expect(sanitizeIntegerLight(NaN)).toBe(null)
  })
})
