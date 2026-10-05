// @vitest-environment node

import { effectScope } from 'vue'

import {
  sanitizeInteger,
  sanitizeIntegerLight,
  useFormat
} from '@/composables/format'

const mocks = vi.hoisted(() => ({ organisation: {} }))

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
vi.mock('vuex', () => ({
  useStore: () => ({
    getters: {
      get organisation() {
        return mocks.organisation
      }
    }
  })
}))

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

describe('useFormat', () => {
  const readDurationUnit = () => {
    const scope = effectScope()
    const unit = scope.run(() => useFormat().durationUnit.value)
    scope.stop()
    return unit
  }

  it('names the duration unit after the organisation setting', () => {
    mocks.organisation = { format_duration_in_hours: true }
    expect(readDurationUnit()).toBe('schedule.hours')

    mocks.organisation = { format_duration_in_hours: false }
    expect(readDurationUnit()).toBe('schedule.md')
  })
})
