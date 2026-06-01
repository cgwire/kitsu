import { describe, it, expect } from 'vitest'

import {
  COUNTRY_CODES,
  getCountryName,
  getCountryOptions
} from '@/lib/countries'

// `locale` is expected to be an Intl-safe code (provided by localeCode in
// @/lib/lang), so these tests pass such codes directly.
describe('lib/countries', () => {
  it('returns an empty string for a falsy code', () => {
    expect(getCountryName(null)).toBe('')
    expect(getCountryName(undefined)).toBe('')
    expect(getCountryName('')).toBe('')
  })

  it('falls back to the raw value for a malformed code', () => {
    expect(getCountryName('bad-code', 'en')).toBe('bad-code')
  })

  it('localizes a country name from its ISO code', () => {
    const name = getCountryName('FR', 'en')
    expect(name).toBeTruthy()
    expect(name).not.toBe('FR')
  })

  it('builds a flat option list of every country, sorted by localized name', () => {
    const options = getCountryOptions('en')

    // Leading empty entry so the field can be cleared.
    expect(options[0]).toEqual({ label: '', value: null })

    const countries = options.slice(1)
    // COUNTRY_CODES must stay duplicate-free, else the picker shows repeated rows.
    expect(new Set(COUNTRY_CODES).size).toBe(COUNTRY_CODES.length)
    expect(countries.length).toBe(COUNTRY_CODES.length)

    const labels = countries.map(o => o.label)
    const collator = new Intl.Collator('en')
    expect(labels).toEqual([...labels].sort((a, b) => collator.compare(a, b)))
  })

  it('never throws when building options, even for an unusable locale', () => {
    expect(() => getCountryOptions('not a locale')).not.toThrow()
    expect(getCountryOptions('not a locale').length).toBe(
      COUNTRY_CODES.length + 1
    )
  })
})
