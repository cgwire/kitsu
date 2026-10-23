// @vitest-environment node

import { createI18n } from 'vue-i18n'

import {
  installI18n,
  registerMessages,
  unregisterMessages
} from '@/lib/plugins/i18n'

describe('plugin i18n setLocaleMessage wrap', () => {
  afterEach(() => {
    unregisterMessages('tickets')
  })

  test('re-merges plugin messages after setLocaleMessage replaces a locale', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: { main: { loading: 'Loading...' } },
        fr: { main: { loading: 'Chargement...' } }
      }
    })

    installI18n(i18n)
    registerMessages(i18n, 'tickets', {
      en: { tickets: { title: 'Tickets' } },
      fr: { tickets: { title: 'Tickets FR' } }
    })

    expect(i18n.global.t('tickets.title')).toBe('Tickets')

    // Mimic Kitsu's lazy locale load: full replace of the locale tree.
    i18n.global.setLocaleMessage('fr', {
      main: { loading: 'Chargement...' }
    })
    i18n.global.locale.value = 'fr'

    expect(i18n.global.t('tickets.title')).toBe('Tickets FR')
    expect(i18n.global.t('main.loading')).toBe('Chargement...')
  })
})
