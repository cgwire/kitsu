import moment from 'moment-timezone'
import { ref } from 'vue'

import i18n from '@/lib/i18n'

const LOCALE_MAP = {
  zh_Hans_CN: { language: 'zh', code: 'zh-cn' },
  zh_Hant_TW: { language: 'zh_tw', code: 'zh-tw' }
}

// Reactive, Intl-safe formatting code for the active language ('en', 'zh-tw', …).
export const localeCode = ref('en')

export default {
  /**
   * Set the locale for the application (vue-i18n + moment.js)
   * @param {string} locale
   */
  setLocale(locale) {
    const fallback = locale?.substring(0, 2) || 'en'
    const { language, code } = LOCALE_MAP[locale] || {
      language: fallback,
      code: fallback
    }

    moment.locale(code)

    i18n.global.locale = language
    localeCode.value = code
  }
}
