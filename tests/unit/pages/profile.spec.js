import { flushPromises } from '@vue/test-utils'
import { createStore } from 'vuex'

import i18n, { loadLocaleMessages } from '@/lib/i18n'
import lang from '@/lib/lang'

import Profile from '@/components/pages/Profile.vue'

import { mountWithI18n } from '../fixtures/i18n'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

const INFO_CARD = 0
const NOTIFICATIONS_CARD = 1

const mountProfile = (saveProfile = vi.fn()) => {
  const store = createStore({
    getters: {
      changePassword: () => ({ isValid: true }),
      user: () => ({ id: 'user-1', full_name: 'Ada Test', locale: 'en_US' })
    },
    actions: { saveProfile }
  })
  return mountWithI18n(Profile, {
    global: {
      plugins: [store],
      stubs: {
        ChangeAvatarModal: true,
        PeopleAvatar: true,
        TwoFactorAuthenticationSetup: true
      }
    }
  })
}

const tryLanguage = async (wrapper, label) => {
  const list = wrapper
    .findAll('select')
    .find(select => select.find('option[value="French (Français)"]').exists())
  await list.setValue(label)
  await flushPromises()
}

const tryFrench = wrapper => tryLanguage(wrapper, 'French (Français)')

const saveCard = async (wrapper, card) => {
  await wrapper.findAll('.save-button')[card].trigger('click')
  await flushPromises()
}

describe('pages/Profile', () => {
  describe('language', () => {
    let wrapper = null

    // Loaded ahead, so that applying them only takes a promise flush.
    beforeAll(() =>
      Promise.all([loadLocaleMessages('fr'), loadLocaleMessages('de')])
    )

    beforeEach(() => lang.setLocale('en_US'))

    afterEach(async () => {
      wrapper?.unmount()
      wrapper = null
      await lang.setLocale('en_US')
      localStorage.removeItem('locale')
    })

    test('shows a language tried in the list without remembering it', async () => {
      wrapper = mountProfile()

      await tryFrench(wrapper)

      expect(i18n.global.locale.value).toBe('fr')
      expect(localStorage.getItem('locale')).toBe('en_US')
    })

    test.each([
      ['info', INFO_CARD],
      ['notifications', NOTIFICATIONS_CARD]
    ])('remembers it once saved from the %s card', async (_, card) => {
      wrapper = mountProfile()
      await tryFrench(wrapper)

      await saveCard(wrapper, card)

      expect(i18n.global.locale.value).toBe('fr')
      expect(localStorage.getItem('locale')).toBe('fr_FR')
    })

    test('does not remember it when the save fails', async () => {
      const saveProfile = vi.fn().mockRejectedValue(new Error('refused'))
      wrapper = mountProfile(saveProfile)
      await tryFrench(wrapper)

      await saveCard(wrapper, INFO_CARD)

      expect(saveProfile).toHaveBeenCalled()
      expect(wrapper.find('.card .error').exists()).toBe(true)
      expect(localStorage.getItem('locale')).toBe('en_US')
    })

    test('keeps the language sent, not one tried during the save', async () => {
      let answer = null
      const saveProfile = vi.fn(
        () =>
          new Promise(resolve => {
            answer = resolve
          })
      )
      wrapper = mountProfile(saveProfile)
      await tryFrench(wrapper)
      await wrapper.findAll('.save-button')[INFO_CARD].trigger('click')

      await tryLanguage(wrapper, 'German (Deutsch)')
      answer()
      await flushPromises()

      expect(i18n.global.locale.value).toBe('de')
      expect(saveProfile.mock.calls[0][1].form.locale).toBe('fr_FR')
      expect(localStorage.getItem('locale')).toBe('fr_FR')
    })
  })
})
