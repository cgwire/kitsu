import store from '../store'
import i18n from '../i18n'

const lang = {
  setLocale (to, from, next) {
    i18n.locale = store.state.user.user.locale.substring(0, 2)
  }
}
export default lang
