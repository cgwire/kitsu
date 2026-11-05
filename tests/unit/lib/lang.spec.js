// @vitest-environment node

import moment from 'moment-timezone'
import { vi } from 'vitest'

import lang, { languages, localeCode } from '@/lib/lang'
import timezone from '@/lib/timezone'

import i18n from '@/lib/i18n'
import { localeLoaders } from '@/locales'
import store from '@/store'

class ColorHash {
  constructor () {
  }

  hex (str) {
    return str
  }
}

globalThis.ColorHash = ColorHash

describe('lang', () => {
  store.commit('USER_LOGIN', {
    id: 'user-1',
    locale: 'fr_FR',
    timezone: 'Europe/Paris'
  })
  test('setLocale', async () => {
    await lang.setLocale('french')
    expect(moment.locale()).toEqual('fr')
    expect(i18n.global.locale.value).toEqual('fr')
    // The lazily loaded chunk registered actual French messages.
    expect(i18n.global.t('main.cancel', {}, { locale: 'fr' })).toEqual('Annuler')
  })

  test('setLocale keeps the last requested language on rapid switches', async () => {
    const first = lang.setLocale('fr_FR')
    const second = lang.setLocale('de_DE')
    await Promise.all([first, second])
    expect(i18n.global.locale.value).toEqual('de')
  })

  test('localeCode tracks the active language with an Intl-safe code', () => {
    lang.setLocale('en_US')
    expect(localeCode.value).toEqual('en')

    // Mapped locale keeps its region (Traditional Chinese).
    lang.setLocale('zh_Hant_TW')
    expect(localeCode.value).toEqual('zh-tw')

    lang.setLocale('fr_FR')
    expect(localeCode.value).toEqual('fr')
  })

  test('lists every language the app ships', async () => {
    const listed = []
    for (const { value } of languages) {
      await lang.setLocale(value)
      listed.push(i18n.global.locale.value)
    }
    await lang.setLocale('en_US')
    expect(listed.sort()).toEqual(['en', ...Object.keys(localeLoaders)].sort())
  })

  // Dates formatted with moment go to the API, which rejects Persian digits.
  test('setLocale keeps Latin digits in Persian dates', async () => {
    await lang.setLocale('fa_IR')
    const date = moment.utc('2026-08-05T09:30:00')
    expect(moment.locale()).toEqual('fa')
    expect(date.format('YYYY-MM-DD')).toEqual('2026-08-05')
    expect(date.format('D MMMM YYYY HH:mm')).toEqual('5 اوت 2026 09:30')
    const parsed = moment.utc('۲۰۲۶-۰۸-۰۵', 'YYYY-MM-DD')
    expect(parsed.format('YYYY-MM-DD')).toEqual('2026-08-05')
    await lang.setLocale('en_US')
  })
})

describe('startup language', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    localStorage.removeItem('locale')
    await lang.setLocale('en_US')
    localStorage.removeItem('locale')
  })

  test('setLocale remembers the language for the next visit', async () => {
    await lang.setLocale('fr_FR')
    expect(localStorage.getItem('locale')).toBe('fr_FR')
  })

  test('setLocale keeps the language remembered for a user without one', async () => {
    await lang.setLocale('fr_FR')
    await lang.setLocale(null)
    expect(localStorage.getItem('locale')).toBe('fr_FR')
  })

  test('starts in the last language used in this browser', async () => {
    localStorage.setItem('locale', 'de_DE')

    await lang.applyStartupLocale()

    expect(i18n.global.locale.value).toBe('de')
    expect(localeCode.value).toBe('de')
    expect(moment.locale()).toBe('de')
  })

  test('starts in English without any remembered language', async () => {
    await lang.setLocale('fr_FR')
    localStorage.removeItem('locale')

    await lang.applyStartupLocale()

    expect(i18n.global.locale.value).toBe('en')
  })

  // The app mounts once this promise settles: a throw would keep it from ever
  // doing so.
  test('turns a storage failure into a rejection', async () => {
    const failure = new Error('The operation is insecure.')
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw failure
    })

    await expect(lang.applyStartupLocale()).rejects.toBe(failure)
  })
})

describe('timezone', () => {
  test('setTimezone', () => {
    expect(moment().tz()).toBeUndefined()
    timezone.setTimezone()
    expect(moment().tz()).toEqual('Europe/Paris')
  })
})
