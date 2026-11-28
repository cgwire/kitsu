import { flushPromises, shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import ChangePasswordModal from '@/components/modals/ChangePasswordModal.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const person = { id: 'admin-2', name: 'Bob Former', totp_enabled: true }

const mountModal = () => {
  const actions = {
    changePasswordPerson: vi.fn(),
    disableTwoFactorAuthenticationPerson: vi.fn()
  }
  const store = createStore({ actions })
  const wrapper = shallowMount(ChangePasswordModal, {
    global: { plugins: [store, i18n], renderStubDefaultSlot: true },
    props: { active: true, person }
  })
  const click = async selector => {
    await wrapper.find(selector).trigger('click')
    await flushPromises()
  }
  return { wrapper, actions, click }
}

const zouAnswer = message => ({ status: 400, body: { error: true, message } })

describe('ChangePasswordModal', () => {
  describe('password change', () => {
    const changePassword = 'button.is-primary'

    // Zou keeps the password of another admin who has one, or of a protected
    // account, for its owner.
    it.each([
      "An admin can't change another admin's password.",
      'This user is in protected accounts.'
    ])('says why Zou refuses it: %s', async message => {
      const { wrapper, actions, click } = mountModal()
      actions.changePasswordPerson.mockRejectedValueOnce(zouAnswer(message))

      await click(changePassword)

      expect(wrapper.text()).toContain('people.change_password_refused')
      expect(wrapper.text()).not.toContain('people.change_password_error')
    })

    it('keeps the generic error for any other failure', async () => {
      const { wrapper, actions, click } = mountModal()
      actions.changePasswordPerson.mockRejectedValueOnce(
        zouAnswer('Password is too short.')
      )

      await click(changePassword)

      expect(wrapper.text()).toContain('people.change_password_error')
      expect(wrapper.text()).not.toContain('people.change_password_refused')
    })

    // A message of the previous click used to stay next to the new one.
    it('clears the password check of the previous click', async () => {
      const { wrapper, actions, click } = mountModal()
      actions.changePasswordPerson
        .mockRejectedValueOnce({ isValidPassword: false })
        .mockRejectedValueOnce(
          zouAnswer("An admin can't change another admin's password.")
        )
      await click(changePassword)
      expect(wrapper.text()).toContain('profile.change_password.unvalid')

      await click(changePassword)

      expect(wrapper.text()).not.toContain('profile.change_password.unvalid')
      expect(wrapper.text()).toContain('people.change_password_refused')
    })
  })

  describe('two-factor authentication', () => {
    const disable2FA = 'button.is-warning'

    // The modal used to stay open with its button active and no message, so
    // a second click got Zou's refusal as an error.
    it('closes once Zou has disabled it', async () => {
      const { wrapper, actions, click } = mountModal()

      await click(disable2FA)

      expect(actions.disableTwoFactorAuthenticationPerson).toHaveBeenCalled()
      expect(wrapper.emitted('confirm')).toHaveLength(1)
    })

    it('says why Zou refuses to disable it for another admin', async () => {
      const { wrapper, actions, click } = mountModal()
      actions.disableTwoFactorAuthenticationPerson.mockRejectedValueOnce(
        zouAnswer("An admin can't disable 2FA for other admins.")
      )

      await click(disable2FA)

      expect(wrapper.text()).toContain('people.disable_2FA_refused')
      expect(wrapper.text()).not.toContain('people.disable_2FA_error')
      expect(wrapper.emitted('confirm')).toBeUndefined()
    })

    it('keeps the generic error for any other failure', async () => {
      const { wrapper, actions, click } = mountModal()
      actions.disableTwoFactorAuthenticationPerson.mockRejectedValueOnce(
        zouAnswer('Two factor authentication not enabled for this user.')
      )

      await click(disable2FA)

      expect(wrapper.text()).toContain('people.disable_2FA_error')
      expect(wrapper.text()).not.toContain('people.disable_2FA_refused')
      expect(wrapper.emitted('confirm')).toBeUndefined()
    })

    it('clears a password refusal of the previous click', async () => {
      const { wrapper, actions, click } = mountModal()
      actions.changePasswordPerson.mockRejectedValueOnce(
        zouAnswer("An admin can't change another admin's password.")
      )
      actions.disableTwoFactorAuthenticationPerson.mockRejectedValueOnce(
        zouAnswer("An admin can't disable 2FA for other admins.")
      )
      await click('button.is-primary')
      expect(wrapper.text()).toContain('people.change_password_refused')

      await click(disable2FA)

      expect(wrapper.text()).not.toContain('people.change_password_refused')
      expect(wrapper.text()).toContain('people.disable_2FA_refused')
    })
  })
})
