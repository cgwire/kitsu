// @vitest-environment node

import moment from 'moment-timezone'
import { vi } from 'vitest'

import lang, { languages, localeCode, pageLocaleCode } from '@/lib/lang'
import pickedLocale from '@/lib/picked-locale'
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

  // vue-i18n warns on the way to its English fallback.
  test.each([
    ['fr_FR', 'fr'],
    ['fr_CA', 'fr'],
    ['zh_Hant_TW', 'zh-tw'],
    ['zh_CN', 'zh-cn'],
    ['sv_SE', 'en']
  ])('declares %s as %s, the language the page reads', async (locale, code) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    await lang.setLocale(locale)

    expect(pageLocaleCode.value).toBe(code)
    await lang.setLocale('en_US')
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
    vi.unstubAllGlobals()
    await lang.setLocale('en_US')
    localStorage.removeItem('locale')
    localStorage.removeItem('studio-locale')
  })

  beforeEach(() => localStorage.removeItem('locale'))

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
    vi.stubGlobal('navigator', { languages: [] })
    await lang.setLocale('fr_FR')
    localStorage.removeItem('locale')

    await lang.applyStartupLocale()

    expect(i18n.global.locale.value).toBe('en')
  })

  describe('browser languages', () => {
    const startWith = async languages => {
      vi.stubGlobal('navigator', { languages })
      await lang.applyStartupLocale()
      return localeCode.value
    }

    test.each([
      [['fr-FR'], 'fr'],
      [['fr-CA'], 'fr'],
      [['de'], 'de'],
      [['pt-PT'], 'pt'],
      [['zh-CN'], 'zh-cn'],
      [['zh'], 'zh-cn'],
      [['zh-SG'], 'zh-cn'],
      [['zh-Hans-HK'], 'zh-cn'],
      [['zh-TW'], 'zh-tw'],
      [['zh-HK'], 'zh-tw'],
      [['zh-MO'], 'zh-tw'],
      [['zh-Hant'], 'zh-tw']
    ])('starts from %j in %s', async (languages, expected) => {
      expect(await startWith(languages)).toBe(expected)
    })

    test('takes the first language Kitsu has', async () => {
      expect(await startWith(['sv-SE', 'nb', 'ja-JP', 'fr-FR'])).toBe('ja')
    })

    test('starts in English for languages Kitsu does not have', async () => {
      expect(await startWith(['sv-SE', 'nb'])).toBe('en')
    })

    test('prefers the language remembered in this browser', async () => {
      localStorage.setItem('locale', 'de_DE')
      expect(await startWith(['fr-FR'])).toBe('de')
    })

    test('takes the language of the studio for lack of a better one', async () => {
      vi.stubGlobal('navigator', { languages: ['sv-SE'] })

      await lang.applyStudioLocale('de_DE')

      expect(localeCode.value).toBe('de')
      expect(localStorage.getItem('locale')).toBeNull()
    })

    // The config answers after the first render.
    test('starts in the language the studio gave on the last visit', async () => {
      vi.stubGlobal('navigator', { languages: ['sv-SE'] })
      await lang.applyStudioLocale('de_DE')
      await lang.setLocale('en_US')
      localStorage.removeItem('locale')

      expect(await startWith(['sv-SE'])).toBe('de')
    })

    test('prefers a browser language to the studio of the last visit', async () => {
      localStorage.setItem('studio-locale', 'de_DE')
      expect(await startWith(['fr-FR'])).toBe('fr')
    })

    test('prefers a remembered language to the studio of the last visit', async () => {
      localStorage.setItem('studio-locale', 'de_DE')
      localStorage.setItem('locale', 'ja_JP')
      expect(await startWith(['sv-SE'])).toBe('ja')
    })

    test('follows a new language of the studio', async () => {
      localStorage.setItem('studio-locale', 'de_DE')
      await startWith(['sv-SE'])

      await lang.applyStudioLocale('fr_FR')

      expect(localeCode.value).toBe('fr')
      expect(localStorage.getItem('studio-locale')).toBe('fr_FR')
    })

    test('ignores the language of the studio for a browser language Kitsu has', async () => {
      vi.stubGlobal('navigator', { languages: ['fr-FR'] })

      await lang.applyStudioLocale('de_DE')

      expect(localeCode.value).toBe('en')
    })

    test('ignores the language of the studio for a remembered language', async () => {
      vi.stubGlobal('navigator', { languages: ['sv-SE'] })
      localStorage.setItem('locale', 'fr_FR')

      await lang.applyStudioLocale('de_DE')

      expect(localeCode.value).toBe('en')
    })

    // A failed config comes as {}.
    test('stays in place without any language for the studio', async () => {
      vi.stubGlobal('navigator', { languages: ['sv-SE'] })

      await lang.applyStudioLocale(undefined)

      expect(localeCode.value).toBe('en')
      expect(localStorage.getItem('studio-locale')).toBeNull()
    })

    // Only a language applied on purpose follows the visitor around.
    test('does not remember the language of the browser', async () => {
      await startWith(['fr-FR'])
      expect(localStorage.getItem('locale')).toBeNull()
    })
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

describe('language picked before login', () => {
  afterEach(async () => {
    sessionStorage.clear()
    await lang.setLocale('en_US')
    localStorage.removeItem('locale')
  })

  test('applies the language and keeps it for the login', async () => {
    await lang.pickLocale('fr_FR')

    expect(i18n.global.locale.value).toBe('fr')
    expect(localStorage.getItem('locale')).toBe('fr_FR')
    expect(pickedLocale.get()).toBe('fr_FR')
  })

  // The tab that picked it logs in. Another one, or a later visit on a shared
  // workstation, must not write it to a profile.
  test('keeps it to this tab', async () => {
    await lang.pickLocale('fr_FR')
    expect(sessionStorage.getItem('picked-locale')).toBe('fr_FR')
    expect(localStorage.getItem('picked-locale')).toBeNull()
  })

  test('applying a language is not picking it', async () => {
    await lang.setLocale('fr_FR')
    expect(pickedLocale.get()).toBeNull()
  })

  test('forgets it once cleared', async () => {
    await lang.pickLocale('fr_FR')
    pickedLocale.clear()
    expect(pickedLocale.get()).toBeNull()
  })

  test.each([
    ['fr_FR', 'fr_FR', true],
    ['fr_FR', 'fr_CA', true],
    ['en_US', 'en_GB', true],
    ['zh_Hans_CN', 'zh_Hant_TW', false],
    ['fr_FR', 'de_DE', false],
    ['fr_FR', null, false]
  ])('compares %s and %s', (locale, otherLocale, expected) => {
    expect(lang.isSameLanguage(locale, otherLocale)).toBe(expected)
  })
})

describe('timezone', () => {
  test('setTimezone', () => {
    expect(moment().tz()).toBeUndefined()
    timezone.setTimezone()
    expect(moment().tz()).toEqual('Europe/Paris')
  })
})
