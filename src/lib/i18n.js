import { createI18n } from 'vue-i18n'

import locales, { localeLoaders } from '@/locales'

const i18n = createI18n({
  legacy: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: locales,
  warnHtmlInMessage: 'off'
})

const loadedLocales = new Set(Object.keys(locales))

/**
 * Load a locale chunk on demand and register its messages. Resolves
 * immediately when the locale is already available (the English variants
 * ship with the main bundle).
 */
export const loadLocaleMessages = async locale => {
  if (loadedLocales.has(locale) || !localeLoaders[locale]) return
  // The locale JSON files nest their messages under a "default" key.
  const messages = (await localeLoaders[locale]()).default.default
  i18n.global.setLocaleMessage(locale, messages)
  loadedLocales.add(locale)
}

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
