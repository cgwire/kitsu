// Localisation
import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)
import locales from './locales'

const i18n = new VueI18n({
  locale: 'fr',
  fallbackLocale: 'en',
  messages: locales
})

export default i18n
