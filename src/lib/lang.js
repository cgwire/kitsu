import moment from 'moment-timezone'
import { computed, ref } from 'vue'

// Moment locales matching src/locales/ (English is built-in).
import 'moment/locale/da'
import 'moment/locale/de'
import 'moment/locale/es'
import 'moment/locale/fa'
import 'moment/locale/fr'
import 'moment/locale/hu'
import 'moment/locale/it'
import 'moment/locale/ja'
import 'moment/locale/ko'
import 'moment/locale/nl'
import 'moment/locale/pl'
import 'moment/locale/pt'
import 'moment/locale/ru'
import 'moment/locale/zh-cn'
import 'moment/locale/zh-tw'

import i18n, { loadLocaleMessages } from '@/lib/i18n'
import localPreferences from '@/lib/preferences'

// The dates sent to the API are formatted with moment, and Zou rejects the
// Persian digits of the fa locale: print Latin ones (Persian ones still parse).
moment.updateLocale('fa', { postformat: string => string })

// Importing or updating a locale activates it; default back to English.
moment.locale('en')

const LOCALE_MAP = {
  zh_Hans_CN: { language: 'zh', code: 'zh-cn' },
  zh_Hant_TW: { language: 'zh_tw', code: 'zh-tw' }
}

const LOCALE_PREFERENCE = 'locale'
const STUDIO_LOCALE_PREFERENCE = 'studio-locale'

// A language tag naming its script overrides its region.
const TRADITIONAL_CHINESE_REGIONS = ['hk', 'mo', 'tw']

// A stalled translation chunk must not leave the page blank: past this delay
// the app starts in English and flips once the chunk lands.
const STARTUP_LOCALE_TIMEOUT = 1000

// Alphabetical by the English name. The native name keeps a language
// recognizable when the UI reads another one.
export const languages = [
  { label: 'Chinese (简体中文)', native: '简体中文', value: 'zh_Hans_CN' },
  { label: 'Chinese TC (繁體中文)', native: '繁體中文', value: 'zh_Hant_TW' },
  { label: 'Danish (Dansk)', native: 'Dansk', value: 'da_DK' },
  { label: 'Dutch (Nederlands)', native: 'Nederlands', value: 'nl_NL' },
  { label: 'English', native: 'English', value: 'en_US' },
  { label: 'French (Français)', native: 'Français', value: 'fr_FR' },
  { label: 'German (Deutsch)', native: 'Deutsch', value: 'de_DE' },
  { label: 'Hungarian (Magyar)', native: 'Magyar', value: 'hu_HU' },
  { label: 'Italian (Italiano)', native: 'Italiano', value: 'it_IT' },
  { label: 'Japanese (日本語)', native: '日本語', value: 'ja_JP' },
  { label: 'Korean (한국어)', native: '한국어', value: 'ko_KR' },
  { label: 'Persian (فارسی)', native: 'فارسی', value: 'fa_IR' },
  { label: 'Polish (Polski)', native: 'Polski', value: 'pl_PL' },
  {
    label: 'Portuguese Brazilian (Português)',
    native: 'Português',
    value: 'pt_BR'
  },
  { label: 'Russian (Русский)', native: 'Русский', value: 'ru_RU' },
  { label: 'Spanish (Español)', native: 'Español', value: 'es_ES' }
]

// Reactive, Intl-safe formatting code for the active language ('en', 'zh-tw', …).
export const localeCode = ref('en')

// Latest language asked for; guards against an older locale chunk landing
// after a newer switch and flipping the UI back.
let pendingLanguage = null

// Code of the language on screen. Moment and localeCode flip ahead of its chunk,
// which may fail.
let displayedCode = 'en'

const getRememberedLocale = () =>
  localPreferences.getPreference(LOCALE_PREFERENCE)

const isTraditionalChinese = subtags =>
  subtags.includes('hant') ||
  (!subtags.includes('hans') &&
    subtags.some(subtag => TRADITIONAL_CHINESE_REGIONS.includes(subtag)))

const toLocale = languageTag => {
  const [language, ...subtags] = languageTag.toLowerCase().split('-')
  if (language === 'zh') {
    return isTraditionalChinese(subtags) ? 'zh_Hant_TW' : 'zh_Hans_CN'
  }
  return languages.find(({ value }) => value.startsWith(`${language}_`))?.value
}

const getBrowserLocale = () => navigator.languages.map(toLocale).find(Boolean)

const getVisitorLocale = () => getRememberedLocale() || getBrowserLocale()

const parseLocale = locale => {
  const fallback = locale?.substring(0, 2) || 'en'
  return LOCALE_MAP[locale] || { language: fallback, code: fallback }
}

// The list entry of the language in use. A profile can hold a region the list
// has not, or a language the app has not, which then reads English.
export const currentLanguage = computed(
  () =>
    languages.find(({ value }) => {
      const { language, code } = parseLocale(value)
      return [language, code].includes(localeCode.value)
    }) || languages.find(({ value }) => value === 'en_US')
)

const applyLocale = async locale => {
  const { language, code } = parseLocale(locale)

  moment.locale(code)
  localeCode.value = code

  pendingLanguage = language
  try {
    await loadLocaleMessages(language)
    if (pendingLanguage === language) {
      i18n.global.locale.value = language
      displayedCode = code
    }
  } catch (err) {
    if (pendingLanguage === language) {
      moment.locale(displayedCode)
      localeCode.value = displayedCode
    }
    throw err
  }
}

export default {
  /**
   * Set the locale for the application (vue-i18n + moment.js) and remember it
   * for the pages shown before the user is known. Translation chunks load on
   * demand, so the vue-i18n locale flips once the messages are registered;
   * the returned promise resolves at that point.
   * @param {string} locale
   */
  setLocale(locale) {
    if (locale) localPreferences.setPreference(LOCALE_PREFERENCE, locale)
    return applyLocale(locale)
  },

  /**
   * Start in the last language used in this browser, else in the first of its
   * languages Kitsu has, else in the one the studio gave on the last visit:
   * nothing else applies one before the guards know the user, and the pages
   * without a guard never do. Async so that nothing here can keep the app from
   * mounting.
   */
  async applyStartupLocale() {
    const locale =
      getVisitorLocale() ||
      localPreferences.getPreference(STUDIO_LOCALE_PREFERENCE)
    // Not a Promise.race: it would swallow a chunk failing past the delay.
    await new Promise(resolve => {
      applyLocale(locale).finally(resolve)
      setTimeout(resolve, STARTUP_LOCALE_TIMEOUT)
    })
  },

  /**
   * Make do with the language of the studio when the browser offers none that
   * Kitsu has. It comes with the config, after the first render: it is kept
   * for the first render of the next visit.
   * @param {string} locale
   */
  async applyStudioLocale(locale) {
    if (!locale) return
    localPreferences.setPreference(STUDIO_LOCALE_PREFERENCE, locale)
    if (!getVisitorLocale()) await applyLocale(locale)
  }
}
