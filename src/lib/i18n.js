import { createI18n } from 'vue-i18n'

import locales from '@/locales'

const i18n = new createI18n({
  allowComposition: true,
  legacy: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: locales
})

/*
 * Enable HMR for locales
 */
if (import.meta.hot) {
  import.meta.hot.accept('@/locales', mod => {
    const updatedMessages = mod.default
    for (const locale of Object.keys(updatedMessages)) {
      i18n.global.setLocaleMessage(locale, updatedMessages[locale])
    }
  })
}

export default i18n
