import moment from 'moment-timezone'
import i18n from '@/lib/i18n'

export default {
  /**
   * Set the locale for the application (vue-i18n + moment.js)
   * @param {string} locale
   */
  setLocale(locale) {
    let language = locale.substring(0, 2)

    if (locale === 'zh_Hans_CN') {
      moment.locale('zh_CN')
    } else if (locale === 'zh_Hant_TW') {
      moment.locale('zh_TW')
      language = 'zw'
    } else {
      moment.locale(language)
    }

    i18n.global.locale = language
  }
}
