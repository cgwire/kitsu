import { flushPromises } from '@vue/test-utils'
import { createStore } from 'vuex'

import i18n, { loadLocaleMessages } from '@/lib/i18n'
import lang from '@/lib/lang'

import Profile from '@/components/pages/Profile.vue'
import Card from '@/components/widgets/Card.vue'
import TextField from '@/components/widgets/TextField.vue'
import TwoFactorAuthentication from '@/components/widgets/TwoFactorAuthentication.vue'

import { mountWithI18n, shallowMountWithI18n } from '../fixtures/i18n'

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

  // Zou asks for the current password to change one's own email, and for a
  // 2FA code when the account has a method enabled.
  describe('email', () => {
    const EMAIL = 'people.fields.email'
    const CURRENT_PASSWORD = 'people.fields.old_password'

    const mountPage = (user = {}, saveProfile = vi.fn()) => {
      const store = createStore({
        getters: {
          changePassword: () => ({ isValid: true }),
          user: () => ({
            id: 'person-1',
            email: 'ada@example.com',
            preferred_two_factor_authentication: null,
            ...user
          })
        },
        actions: { saveProfile }
      })
      const wrapper = shallowMountWithI18n(Profile, {
        global: { plugins: [store], renderStubDefaultSlot: true }
      })
      return { wrapper, saveProfile }
    }

    const findFields = (wrapper, label) =>
      wrapper
        .findAllComponents(TextField)
        .filter(field => field.props('label') === i18n.global.t(label))

    const type = (wrapper, label, value) =>
      findFields(wrapper, label)[0].vm.$emit('update:modelValue', value)

    const save = (wrapper, card) =>
      wrapper.findAllComponents(Card)[card].vm.$emit('save')

    test('asks for the current password once the email is edited', async () => {
      const { wrapper, saveProfile } = mountPage()
      // The password card has a current password field of its own.
      expect(findFields(wrapper, CURRENT_PASSWORD)).toHaveLength(1)

      await type(wrapper, EMAIL, 'new@example.com')
      expect(findFields(wrapper, CURRENT_PASSWORD)).toHaveLength(2)
      await type(wrapper, CURRENT_PASSWORD, 'secret')
      await save(wrapper, INFO_CARD)
      await flushPromises()

      expect(saveProfile.mock.calls[0][1]).toEqual({
        form: expect.objectContaining({ email: 'new@example.com' }),
        currentPassword: 'secret',
        twoFactorPayload: undefined
      })
    })

    test('asks for a 2FA code too when a method is enabled', async () => {
      const { wrapper, saveProfile } = mountPage({ totp_enabled: true })
      await type(wrapper, EMAIL, 'new@example.com')
      await type(wrapper, CURRENT_PASSWORD, 'secret')

      await save(wrapper, INFO_CARD)

      expect(saveProfile).not.toHaveBeenCalled()
      const codeCheck = wrapper.findComponent(TwoFactorAuthentication)
      expect(codeCheck.props('twoFasEnabled')).toEqual([
        'totp',
        'recovery_code'
      ])

      codeCheck.vm.$emit('validate', { totp: '123456' })
      await flushPromises()

      expect(saveProfile.mock.calls[0][1]).toMatchObject({
        currentPassword: 'secret',
        twoFactorPayload: { totp: '123456' }
      })
      expect(wrapper.findComponent(TwoFactorAuthentication).exists()).toBe(
        false
      )
    })

    test('tells when the email is refused', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const refused = vi.fn(() => Promise.reject({ body: {} }))
      const { wrapper } = mountPage({}, refused)
      await type(wrapper, EMAIL, 'new@example.com')

      await save(wrapper, INFO_CARD)
      await flushPromises()

      expect(wrapper.findAllComponents(Card)[INFO_CARD].props('error')).toBe(
        i18n.global.t('profile.save.error_email')
      )
    })

    // The store updates the user in place, as the user module does: the
    // form follows a user loaded again, not its own save.
    test('keeps an unsaved email when the other card is saved', async () => {
      const store = createStore({
        state: { user: { id: 'person-1', email: 'ada@example.com' } },
        getters: {
          changePassword: () => ({ isValid: true }),
          user: state => state.user
        },
        mutations: {
          save(state, form) {
            Object.assign(state.user, form)
          }
        },
        actions: {
          saveProfile: ({ commit }, { form }) => commit('save', form)
        }
      })
      const wrapper = shallowMountWithI18n(Profile, {
        global: { plugins: [store], renderStubDefaultSlot: true }
      })
      await type(wrapper, EMAIL, 'new@example.com')

      await save(wrapper, NOTIFICATIONS_CARD)
      await flushPromises()

      expect(store.state.user.email).toBe('ada@example.com')
      expect(findFields(wrapper, EMAIL)[0].props('modelValue')).toBe(
        'new@example.com'
      )
    })

    test('leaves the email out of the notification settings', async () => {
      const { wrapper, saveProfile } = mountPage()
      await type(wrapper, EMAIL, 'new@example.com')

      await save(wrapper, NOTIFICATIONS_CARD)
      await flushPromises()

      expect(saveProfile.mock.calls[0][1]).toMatchObject({
        form: { email: 'ada@example.com' },
        currentPassword: undefined
      })
    })
  })
})
