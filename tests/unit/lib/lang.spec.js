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
})

describe('timezone', () => {
  test('setTimezone', () => {
    expect(moment().tz()).toBeUndefined()
    timezone.setTimezone()
    expect(moment().tz()).toEqual('Europe/Paris')
  })
})
