import { flushPromises } from '@vue/test-utils'
import { createStore } from 'vuex'

import i18n, { loadLocaleMessages } from '@/lib/i18n'
import lang, { languages } from '@/lib/lang'
import pickedLocale from '@/lib/picked-locale'
import { localeLoaders } from '@/locales'

import PublicPageSettings from '@/components/widgets/PublicPageSettings.vue'

import { mountWithI18n } from '../fixtures/i18n'

const mountSettings = ({ errorHandler, isDarkTheme = false } = {}) => {
  const store = createStore({
    state: { isDarkTheme },
    getters: { isDarkTheme: state => state.isDarkTheme },
    actions: {
      toggleDarkTheme({ state }) {
        state.isDarkTheme = !state.isDarkTheme
      }
    }
  })
  return mountWithI18n(PublicPageSettings, {
    global: { config: { errorHandler }, plugins: [store] }
  })
}

describe('widgets/PublicPageSettings', () => {
  let wrapper = null

  afterEach(async () => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
    await lang.setLocale('en_US')
    localStorage.removeItem('locale')
    sessionStorage.clear()
  })

  describe('language', () => {
    test.each([
      ['fr_FR', 'Français', 'fr_FR'],
      ['zh_Hans_CN', '简体中文', 'zh_Hans_CN'],
      ['zh_Hant_TW', '繁體中文', 'zh_Hant_TW'],
      // A profile can hold a region the list has not.
      ['fr_CA', 'Français', 'fr_FR'],
      ['en_GB', 'English', 'en_US'],
      ['zh_CN', '简体中文', 'zh_Hans_CN']
    ])('selects %s under its native name', async (locale, name, value) => {
      await lang.setLocale(locale)

      wrapper = mountSettings()

      const select = wrapper.find('select').element
      expect(select.value).toBe(value)
      expect(select.selectedOptions[0].text).toBe(name)
    })

    // vue-i18n warns on the way to its English fallback.
    test('selects English for a language of a profile the app has not', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      await lang.setLocale('sv_SE')

      wrapper = mountSettings()

      expect(consoleWarn).toHaveBeenCalled()
      expect(wrapper.find('select').element.value).toBe('en_US')
    })

    test('shows an icon in place of the name of the language', () => {
      wrapper = mountSettings()

      const setting = wrapper.find('.language .setting')

      expect(setting.text()).toBe('')
      expect(setting.find('.lucide-languages').exists()).toBe(true)
      expect(wrapper.find('.language').attributes('title')).toBe('Language')
      expect(wrapper.find('select').attributes('aria-label')).toBe('Language')
    })

    test('lists the languages under their native names', () => {
      wrapper = mountSettings()

      const options = wrapper.findAll('option')

      expect(options.map(option => option.text())).toEqual(
        languages.map(({ native }) => native)
      )
      expect(options.map(option => option.element.value)).toEqual(
        languages.map(({ value }) => value)
      )
    })

    test('switches to the language picked', async () => {
      await loadLocaleMessages('fr')
      wrapper = mountSettings()

      await wrapper.find('select').setValue('fr_FR')
      await flushPromises()

      expect(i18n.global.locale.value).toBe('fr')
      expect(wrapper.find('select').attributes('aria-label')).toBe('Langue')
    })

    // The language on screen must stay in reach of the list.
    test('goes back to the language in use when its chunk fails', async () => {
      const failure = new Error('Failed to fetch dynamically imported module')
      vi.spyOn(localeLoaders, 'ko').mockRejectedValue(failure)
      const errorHandler = vi.fn()
      wrapper = mountSettings({ errorHandler })

      await wrapper.find('select').setValue('ko_KR')
      await flushPromises()

      expect(errorHandler.mock.calls[0][0]).toBe(failure)
      expect(wrapper.find('select').element.value).toBe('en_US')
    })

    test('keeps the language picked for the login', async () => {
      await loadLocaleMessages('fr')
      wrapper = mountSettings()

      await wrapper.find('select').setValue('fr_FR')
      await flushPromises()

      expect(pickedLocale.get()).toBe('fr_FR')
    })
  })

  describe('theme', () => {
    test('is a switch, off in the light theme', () => {
      wrapper = mountSettings()

      const button = wrapper.find('.theme-button')

      expect(button.attributes('role')).toBe('switch')
      expect(button.attributes('aria-checked')).toBe('false')
      expect(button.attributes('aria-label')).toBe('Dark Theme')
      expect(button.attributes('title')).toBe('Dark Theme')
      expect(button.attributes('type')).toBe('button')
      expect(button.find('.lucide-sun').exists()).toBe(true)
    })

    // A switch keeps its name: only its state tells the theme in use.
    test('turns on with the dark theme', async () => {
      wrapper = mountSettings()

      await wrapper.find('.theme-button').trigger('click')

      const button = wrapper.find('.theme-button')
      expect(button.attributes('aria-checked')).toBe('true')
      expect(button.attributes('aria-label')).toBe('Dark Theme')
      expect(button.find('.lucide-moon').exists()).toBe(true)
    })

    test('names the theme in the language in use', async () => {
      await lang.setLocale('fr_FR')

      wrapper = mountSettings({ isDarkTheme: true })

      expect(wrapper.find('.theme-button').attributes('aria-label')).toBe(
        'Thème sombre'
      )
    })
  })
})
