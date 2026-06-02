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
  test('setLocale', () => {
    lang.setLocale('french')
    expect(moment.locale()).toEqual('fr')
    expect(i18n.global.locale).toEqual('fr')
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
