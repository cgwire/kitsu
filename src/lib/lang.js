import moment from 'moment-timezone'

import store from '../store'
import i18n from './i18n'

const lang = {

  /*
   * Configure i18n libs the locale extracted from user information.
   */
  setLocale () {
    const locale = store.state.user.user.locale
    i18n.locale = locale.substring(0, 2)
    if (locale === 'zh_Hans_CN') {
      moment.locale('zh_CN')
    } else if (locale === 'zh_Hant_TW') {
      moment.locale('zh_TW')
    } else {
      moment.locale(locale.substring(0, 2))
    }
  }
}
export default lang
