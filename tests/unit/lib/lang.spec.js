import moment from 'moment-timezone'
import lang from '@/lib/lang'
import timezone from '@/lib/timezone'

import i18n from '@/lib/i18n'
import store from '@/store'

class ColorHash {
  constructor (colorData) {
  }

  hex (str) {
    return str
  }
}

global.ColorHash = ColorHash

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
})

describe('timezone', () => {
  test('setTimezone', () => {
    expect(moment().tz()).toBeUndefined()
    timezone.setTimezone()
    expect(moment().tz()).toEqual('Europe/Paris')
  })
})
