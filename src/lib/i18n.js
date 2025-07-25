import { createI18n } from 'vue-i18n'

import locales from '@/locales'

const i18n = new createI18n({
  allowComposition: true,
  legacy: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: locales
})

export default i18n
