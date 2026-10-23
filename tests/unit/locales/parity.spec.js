// @vitest-environment node

import { beforeAll, describe, expect, it } from 'vitest'

import en from '@/locales/en'
import { localeLoaders } from '@/locales'

// vue-i18n falls back to en, so a key missing from a locale renders in
// English without warning. Nothing but this check catches it.
const flatten = (messages, prefix = '') =>
  Object.entries(messages).flatMap(([key, value]) =>
    value && typeof value === 'object'
      ? flatten(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value]]
  )

const enEntries = flatten(en)
const enKeys = new Set(enEntries.map(([key]) => key))
const enPlurals = new Map(
  enEntries
    .filter(([, value]) => typeof value === 'string' && value.includes('|'))
    .map(([key, value]) => [key, value.split('|').length])
)

// Same access path as loadLocaleMessages: the files nest under "default".
const loadLocale = async locale =>
  new Map(flatten((await localeLoaders[locale]()).default.default))

// One entry per locale with drifted keys, so a failure names each locale
// and every key at fault.
const driftByLocale = findDrift =>
  Object.fromEntries(
    [...localeMessages.entries()]
      .map(([locale, messages]) => [locale, findDrift(messages)])
      .filter(([, keys]) => keys.length > 0)
  )

let localeMessages

describe('locales', () => {
  beforeAll(async () => {
    const locales = Object.keys(localeLoaders)
    localeMessages = new Map(
      await Promise.all(
        locales.map(async locale => [locale, await loadLocale(locale)])
      )
    )
  })

  it('translate every key of en.js', () => {
    expect(
      driftByLocale(messages =>
        [...enKeys].filter(key => !messages.has(key))
      )
    ).toEqual({})
  })

  it('keep no key en.js has dropped', () => {
    expect(
      driftByLocale(messages =>
        [...messages.keys()].filter(key => !enKeys.has(key))
      )
    ).toEqual({})
  })

  it('keep the plural segments of en.js', () => {
    // Every locale uses the default plural resolver, which picks the segment
    // by index: an extra grammatical form shifts the whole message.
    expect(
      driftByLocale(messages =>
        [...enPlurals.entries()]
          .filter(
            ([key, count]) => messages.get(key)?.split('|').length !== count
          )
          .map(([key]) => key)
      )
    ).toEqual({})
  })
})
