// @vitest-environment node

import moment from 'moment-timezone'
import { vi } from 'vitest'

import { recordUnhandledRejections } from '../fixtures/unhandled-rejections'

const h = vi.hoisted(() => ({ load: null }))

// A chunk loads once: each test starts in a language of its own.
vi.mock('@/locales', async importOriginal => ({
  ...(await importOriginal()),
  localeLoaders: Object.fromEntries(
    ['da', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pl', 'pt'].map(language => [
      language,
      () => h.load(language)
    ])
  )
}))

import i18n from '@/lib/i18n'
import lang, { localeCode } from '@/lib/lang'

const messages = { default: { default: { main: { cancel: 'Translated' } } } }
const failure = new Error('Failed to fetch dynamically imported module')

const trackSettled = promise => {
  const tracker = { isSettled: false }
  const settle = () => {
    tracker.isSettled = true
  }
  promise.finally(settle).catch(() => {})
  return tracker
}

const loadOnDemand = () => {
  const chunks = {}
  h.load = language =>
    new Promise((resolve, reject) => {
      chunks[language] = { land: () => resolve(messages), fail: reject }
    })
  return chunks
}

const getLanguages = () => ({
  messages: i18n.global.locale.value,
  code: localeCode.value,
  dates: moment.locale()
})

describe('startup language chunk', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(async () => {
    vi.useRealTimers()
    await lang.setLocale('en_US')
    localStorage.removeItem('locale')
  })

  test('waits for the translations before the first render', async () => {
    localStorage.setItem('locale', 'fr_FR')
    const chunks = loadOnDemand()

    const startup = trackSettled(lang.applyStartupLocale())
    await vi.advanceTimersByTimeAsync(999)
    expect(startup.isSettled).toBe(false)

    chunks.fr.land()
    await vi.advanceTimersByTimeAsync(0)

    expect(startup.isSettled).toBe(true)
    expect(i18n.global.locale.value).toBe('fr')
  })

  // A stalled chunk would leave the page blank.
  test('stops waiting once the delay is over, and still flips', async () => {
    localStorage.setItem('locale', 'de_DE')
    const chunks = loadOnDemand()

    const startup = trackSettled(lang.applyStartupLocale())
    await vi.advanceTimersByTimeAsync(1000)
    expect(startup.isSettled).toBe(true)
    expect(i18n.global.locale.value).toBe('en')

    chunks.de.land()
    await vi.advanceTimersByTimeAsync(0)

    expect(i18n.global.locale.value).toBe('de')
  })

  // Unhandled, it reaches the console.
  test('leaves a failed chunk unhandled, and settles', async () => {
    localStorage.setItem('locale', 'es_ES')
    h.load = () => Promise.reject(failure)

    const rejections = await recordUnhandledRejections(() =>
      lang.applyStartupLocale()
    )

    expect(rejections).toEqual([failure])
    expect(getLanguages()).toEqual({ messages: 'en', code: 'en', dates: 'en' })
  })

  test('leaves a chunk failing after the delay unhandled too', async () => {
    localStorage.setItem('locale', 'da_DK')
    const chunks = loadOnDemand()

    const rejections = await recordUnhandledRejections(async () => {
      const startup = lang.applyStartupLocale()
      await vi.advanceTimersByTimeAsync(1000)
      await startup
      chunks.da.fail(failure)
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(rejections).toEqual([failure])
    expect(getLanguages()).toEqual({ messages: 'en', code: 'en', dates: 'en' })
  })
})

describe('language chunks out of order', () => {
  afterEach(async () => {
    await lang.setLocale('en_US')
    localStorage.removeItem('locale')
  })

  test('leaves the language of the last request in place', async () => {
    const chunks = loadOnDemand()
    const older = lang.setLocale('it_IT')
    const newer = lang.setLocale('ja_JP')

    chunks.ja.land()
    await newer
    chunks.it.land()
    await older

    expect(getLanguages()).toEqual({ messages: 'ja', code: 'ja', dates: 'ja' })
  })

  // The dates and the lang attribute would name another language than the page.
  test('goes back to the language on screen when a chunk fails', async () => {
    h.load = () => Promise.resolve(messages)
    await lang.setLocale('ko_KR')
    h.load = () => Promise.reject(failure)

    await expect(lang.setLocale('nl_NL')).rejects.toBe(failure)

    expect(getLanguages()).toEqual({ messages: 'ko', code: 'ko', dates: 'ko' })
  })

  test('leaves the last request alone when an older chunk fails', async () => {
    const chunks = loadOnDemand()
    const older = lang.setLocale('pl_PL')
    const newer = lang.setLocale('pt_BR')

    chunks.pl.fail(failure)
    await expect(older).rejects.toBe(failure)
    chunks.pt.land()
    await newer

    expect(getLanguages()).toEqual({ messages: 'pt', code: 'pt', dates: 'pt' })
  })
})
