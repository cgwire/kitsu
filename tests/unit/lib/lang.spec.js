// @vitest-environment node

import moment from 'moment-timezone'
import lang, { localeCode } from '@/lib/lang'
import timezone from '@/lib/timezone'

import i18n from '@/lib/i18n'
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
    expect(i18n.global.locale).toEqual('fr')
    // The lazily loaded chunk registered actual French messages.
    expect(i18n.global.t('assets.cast_in', 'fr')).toEqual('Présent dans')
  })

  test('setLocale keeps the last requested language on rapid switches', async () => {
    const first = lang.setLocale('fr_FR')
    const second = lang.setLocale('de_DE')
    await Promise.all([first, second])
    expect(i18n.global.locale).toEqual('de')
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

describe('timezone', () => {
  test('setTimezone', () => {
    expect(moment().tz()).toBeUndefined()
    timezone.setTimezone()
    expect(moment().tz()).toEqual('Europe/Paris')
  })
})
