import moment from 'moment-timezone'
import i18n from '@/lib/i18n'

const LOCALE_MAP = {
  zh_Hans_CN: { language: 'zh', localeCode: 'zh-cn' },
  zh_Hant_TW: { language: 'zw', localeCode: 'zh-tw' }
}

export default {
  /**
   * Set the locale for the application (vue-i18n + moment.js)
   * @param {string} locale
   */
  setLocale(locale) {
    const { language, localeCode } = LOCALE_MAP[locale] || {
      language: locale.substring(0, 2),
      localeCode: locale.substring(0, 2)
    }

    moment.locale(localeCode)

    i18n.global.locale = language
    i18n.global.locale_code = localeCode
  }
}
