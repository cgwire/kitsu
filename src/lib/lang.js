import moment from 'moment-timezone'

import store from '../store'
import i18n from './i18n'

const lang = {

  /*
   * Configure i18n libs the locale extracted from user information.
   */
  setLocale () {
    i18n.locale = store.state.user.user.locale.substring(0, 2)
    moment.locale(i18n.locale)
  }
}
export default lang
