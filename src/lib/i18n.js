import { createI18n } from 'vue-i18n'

import locales, { localeLoaders } from '@/locales'

// vue-i18n 11 makes any decimal count plural, whatever the language. Its
// language decides here: "0.5 days", but "0,5 jour" and "1,5 jour". Intl
// rejects keys such as en_nft or zh_tw, so it gets the part before the "_".
const decimalPluralRule = locale => {
  const rules = new Intl.PluralRules(locale.split('_')[0])
  return (choice, choicesLength, defaultRule) => {
    if (choicesLength !== 2 || Number.isInteger(choice)) {
      return defaultRule(choice, choicesLength)
    }
    return rules.select(Math.abs(choice)) === 'one' ? 0 : 1
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: locales,
  pluralRules: Object.fromEntries(
    [...Object.keys(locales), ...Object.keys(localeLoaders)].map(locale => [
      locale,
      decimalPluralRule(locale)
    ])
  ),
  warnHtmlMessage: false
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
