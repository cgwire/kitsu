const contributions = new Map()

const globalOf = i18n => i18n.global

const merge = (i18n, messages) => {
  for (const [locale, values] of Object.entries(messages)) {
    globalOf(i18n).mergeLocaleMessage(locale, values)
  }
}

export const registerMessages = (i18n, owner, messages) => {
  contributions.set(owner, messages)
  merge(i18n, messages)
}

export const unregisterMessages = owner => {
  contributions.delete(owner)
}

/**
 * Kitsu loads locales lazily through `setLocaleMessage`, which replaces the
 * whole locale and would drop keys plugins merged via `mergeLocaleMessage`.
 * Wrap `setLocaleMessage` so every replacement re-merges active plugin
 * contributions. Do not remove this wrap without another way to keep plugin
 * messages across locale swaps.
 */
export const installI18n = i18n => {
  const composer = globalOf(i18n)
  const original = composer.setLocaleMessage.bind(composer)

  composer.setLocaleMessage = (locale, messages) => {
    original(locale, messages)
    for (const contribution of contributions.values()) {
      const forLocale = contribution[locale]
      if (forLocale) composer.mergeLocaleMessage(locale, forLocale)
    }
  }
}
