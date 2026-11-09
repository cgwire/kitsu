// The language a visitor picked by hand, until a login takes it to the profile.
// The logout drops it, from a store module: importing lang.js there would pull
// vue-i18n. It stays in the tab, so that a pick never reaches another one.
const PICKED_LOCALE_KEY = 'picked-locale'

export default {
  get() {
    return sessionStorage.getItem(PICKED_LOCALE_KEY)
  },

  set(locale) {
    if (locale) sessionStorage.setItem(PICKED_LOCALE_KEY, locale)
    else this.clear()
  },

  clear() {
    sessionStorage.removeItem(PICKED_LOCALE_KEY)
  }
}
