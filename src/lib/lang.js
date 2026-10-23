import moment from 'moment-timezone'
import { ref } from 'vue'

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

// The dates sent to the API are formatted with moment, and Zou rejects the
// Persian digits of the fa locale: print Latin ones (Persian ones still parse).
moment.updateLocale('fa', { postformat: string => string })

// Importing or updating a locale activates it; default back to English.
moment.locale('en')

const LOCALE_MAP = {
  zh_Hans_CN: { language: 'zh', code: 'zh-cn' },
  zh_Hant_TW: { language: 'zh_tw', code: 'zh-tw' }
}

// Reactive, Intl-safe formatting code for the active language ('en', 'zh-tw', …).
export const localeCode = ref('en')

// Latest language asked for; guards against an older locale chunk landing
// after a newer switch and flipping the UI back.
let pendingLanguage = null

export default {
  /**
   * Set the locale for the application (vue-i18n + moment.js). Translation
   * chunks load on demand, so the vue-i18n locale flips once the messages
   * are registered; the returned promise resolves at that point.
   * @param {string} locale
   */
  setLocale(locale) {
    const fallback = locale?.substring(0, 2) || 'en'
    const { language, code } = LOCALE_MAP[locale] || {
      language: fallback,
      code: fallback
    }

    moment.locale(code)
    localeCode.value = code

    pendingLanguage = language
    return loadLocaleMessages(language).then(() => {
      if (pendingLanguage === language) {
        i18n.global.locale.value = language
      }
    })
  }
}
