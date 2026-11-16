import { useHead } from '@unhead/vue'
import {
  flushPromises,
  mount,
  RouterLinkStub,
  shallowMount
} from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

const route = vi.hoisted(() => ({ query: {} }))

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push: vi.fn() })
}))

import errors from '@/lib/errors'

import ResetChangePassword from '@/components/pages/ResetChangePassword.vue'
import Spinner from '@/components/widgets/Spinner.vue'

import { mountWithI18n } from '../fixtures/i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const createPageStore = (
  resetChangePassword,
  resetPassword = vi.fn(),
  checkResetToken = vi.fn(() => true)
) =>
  createStore({
    actions: { checkResetToken, resetChangePassword, resetPassword },
    mutations: { LOGIN_SUCCESS: () => {} }
  })

const mountPage = (resetChangePassword, resetPassword, checkResetToken) =>
  shallowMount(ResetChangePassword, {
    global: {
      plugins: [
        i18n,
        createPageStore(resetChangePassword, resetPassword, checkResetToken)
      ],
      stubs: { RouterLink: RouterLinkStub }
    }
  })

// The form shows once Zou tells the link is valid.
const openPage = async (...actions) => {
  const wrapper = mountPage(...actions)
  await flushPromises()
  return wrapper
}

const fillPasswords = async wrapper => {
  const [password, password2] = wrapper.findAll('input[type="password"]')
  await password.setValue('a strong password')
  await password2.setValue('a strong password')
}

const submitPasswords = async wrapper => {
  await fillPasswords(wrapper)
  await wrapper.find('a.main-button').trigger('click')
  await flushPromises()
}

const rejectDeadLink = () =>
  Promise.reject({ body: { message: 'Wrong or expired token.' } })

// The API client marks the failed requests, which it reports on its own.
const requestFailure = message => {
  const failure = new Error(message)
  errors.markRequestFailure(failure)
  return failure
}

// A bug, unlike a failed request, reaches the error handler of the app.
const mountWithErrorHandler = (errorHandler, ...actions) =>
  shallowMount(ResetChangePassword, {
    global: {
      config: { errorHandler },
      plugins: [i18n, createPageStore(...actions)],
      stubs: { RouterLink: RouterLinkStub }
    }
  })

describe('pages/ResetChangePassword', () => {
  beforeEach(() => {
    route.query = { email: 'jane@example.com', token: 'token-1' }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('titles the tab like its heading', () => {
    const resetPage = mountPage(vi.fn())
    expect(useHead.mock.lastCall[0].title.value).toBe(
      resetPage.find('h1').text()
    )

    route.query.type = 'new'
    const invitationPage = mountPage(vi.fn())
    expect(invitationPage.find('h1').text()).toBe('login.set_password_title')
    expect(useHead.mock.lastCall[0].title.value).toBe(
      invitationPage.find('h1').text()
    )
  })

  // Password managers file the new password under the username of its form,
  // which the page does not show.
  it('names the account of the link in a hidden field', () => {
    const wrapper = mountPage(vi.fn())

    const username = wrapper.find('input[autocomplete="username"]')
    expect(username.element.value).toBe('jane@example.com')
    expect(username.element.hidden).toBe(true)
  })

  it('counts down to one second in the singular', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    const wrapper = mountWithI18n(ResetChangePassword, {
      global: {
        plugins: [createPageStore(() => {})],
        stubs: { RouterLink: true }
      }
    })
    await flushPromises()
    await fillPasswords(wrapper)

    await wrapper.find('a.main-button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Redirecting in 5 seconds...')
    vi.advanceTimersByTime(4000)
    await nextTick()

    expect(wrapper.text()).toContain('Redirecting in 1 second...')
    wrapper.unmount()
  })

  it('sends the new password once while the request runs', async () => {
    const resetChangePassword = vi.fn(() => new Promise(() => {}))
    const wrapper = await openPage(resetChangePassword)
    await fillPasswords(wrapper)
    const submit = wrapper.find('a.main-button')

    await submit.trigger('click')
    // The spinner of is-loading is a Bulma .button rule.
    expect(submit.classes()).toEqual(
      expect.arrayContaining(['button', 'is-loading'])
    )
    await submit.trigger('click')
    await wrapper.find('input[type="password"]').trigger('keyup.enter')

    expect(resetChangePassword).toHaveBeenCalledTimes(1)
  })

  it('sends it again after a failure', async () => {
    const resetChangePassword = vi.fn(() => Promise.reject(new Error('down')))
    const wrapper = await openPage(resetChangePassword)
    await fillPasswords(wrapper)
    const submit = wrapper.find('a.main-button')

    await submit.trigger('click')
    await flushPromises()
    expect(wrapper.findAll('input[type="password"]')).toHaveLength(2)
    expect(wrapper.text()).not.toContain('login.send_new_link')
    await submit.trigger('click')

    expect(resetChangePassword).toHaveBeenCalledTimes(2)
  })

  it('sends nothing more once the password is set', async () => {
    // Zou spends the token on the first success.
    const resetChangePassword = vi
      .fn()
      .mockResolvedValueOnce()
      .mockRejectedValue({ body: { message: 'Wrong or expired token.' } })
    const wrapper = await openPage(resetChangePassword)
    await fillPasswords(wrapper)
    const password = wrapper.find('input[type="password"]')

    await password.trigger('keyup.enter')
    await flushPromises()
    await password.trigger('keyup.enter')
    await flushPromises()

    expect(resetChangePassword).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.success').exists()).toBe(true)
    expect(wrapper.find('.error').exists()).toBe(false)
    wrapper.unmount()
  })

  describe('when the page opens', () => {
    const passwordFields = wrapper => wrapper.findAll('input[type="password"]')

    it('holds the form back until Zou tells the link is valid', async () => {
      let answer
      const checkResetToken = vi.fn(
        () => new Promise(resolve => (answer = resolve))
      )
      const resetChangePassword = vi.fn()
      const wrapper = mountPage(resetChangePassword, vi.fn(), checkResetToken)

      expect(checkResetToken.mock.calls[0][1]).toEqual({
        email: 'jane@example.com',
        token: 'token-1'
      })
      // Hidden, the form keeps its place: the box does not change size.
      const hidden = wrapper.find('.is-checking')
      expect(hidden.findAll('input[type="password"]')).toHaveLength(2)
      expect(hidden.findComponent(Spinner).exists()).toBe(true)
      expect(wrapper.find('.box').attributes('aria-busy')).toBe('true')
      await fillPasswords(wrapper)
      await wrapper.find('a.main-button').trigger('click')
      expect(resetChangePassword).not.toHaveBeenCalled()
      answer(true)
      await flushPromises()

      expect(wrapper.find('.is-checking').exists()).toBe(false)
      expect(wrapper.find('.box').attributes('aria-busy')).toBe('false')
      expect(passwordFields(wrapper)).toHaveLength(2)
      expect(wrapper.find('a.main-button').text()).toBe(
        'login.reset_change_password'
      )
      expect(wrapper.findComponent(Spinner).exists()).toBe(false)
    })

    describe('focus', () => {
      // In a browser, a field hidden during the check cannot take the focus
      // of v-focus: only the page can give it, once the check is done.
      const mountAttached = checkResetToken =>
        mount(ResetChangePassword, {
          attachTo: document.body,
          global: {
            plugins: [i18n, createPageStore(vi.fn(), vi.fn(), checkResetToken)],
            stubs: { RouterLink: RouterLinkStub },
            directives: { focus: {} }
          }
        })

      it('goes to the first field of a valid link', async () => {
        const wrapper = mountAttached(vi.fn(() => true))
        const field = wrapper.find('input[type="password"]').element
        // In a browser, a field still hidden would not take the focus.
        let isHiddenOnFocus = null
        field.addEventListener('focus', () => {
          isHiddenOnFocus = Boolean(field.closest('.is-checking'))
        })
        await flushPromises()

        expect(document.activeElement).toBe(field)
        expect(isHiddenOnFocus).toBe(false)
        wrapper.unmount()
      })

      it('stays put for a dead link, whose message is announced', async () => {
        // A focus given on load would draw its ring for mouse users too.
        const wrapper = mountAttached(vi.fn(() => false))
        await flushPromises()

        expect(document.activeElement).toBe(document.body)
        expect(wrapper.find('.error').attributes('role')).toBe('alert')
        wrapper.unmount()
      })

      it('stays where the user put it during the check', async () => {
        let answer
        const wrapper = mountAttached(
          vi.fn(() => new Promise(resolve => (answer = resolve)))
        )
        // The language switch sits outside the page.
        const languageSwitch = document.createElement('button')
        document.body.appendChild(languageSwitch)
        languageSwitch.focus()
        answer(true)
        await flushPromises()

        expect(document.activeElement).toBe(languageSwitch)
        languageSwitch.remove()
        wrapper.unmount()
      })
    })

    it('offers a new link at once when the link is dead', async () => {
      const wrapper = await openPage(
        vi.fn(),
        vi.fn(),
        vi.fn(() => false)
      )

      expect(passwordFields(wrapper)).toHaveLength(0)
      expect(wrapper.find('.error').text()).toBe(
        'login.reset_change_password_token_failed'
      )
      expect(wrapper.find('a.main-button').text()).toBe('login.send_new_link')
      expect(wrapper.findComponent(RouterLinkStub).text()).toBe(
        'login.back_to_login'
      )
    })

    it('shows the form when the check fails', async () => {
      // An older Zou has no such route: setting the password checks the
      // link anyway.
      const wrapper = await openPage(
        vi.fn(),
        vi.fn(),
        vi.fn(() => Promise.reject(requestFailure('not found')))
      )

      expect(passwordFields(wrapper)).toHaveLength(2)
      expect(wrapper.find('.error').exists()).toBe(false)
      expect(wrapper.findComponent(Spinner).exists()).toBe(false)
    })

    it('leaves a bug of the check to Sentry, and shows the form', async () => {
      const bug = new TypeError('a bug')
      const errorHandler = vi.fn()
      const wrapper = mountWithErrorHandler(
        errorHandler,
        vi.fn(),
        vi.fn(),
        vi.fn(() => Promise.reject(bug))
      )
      await flushPromises()

      expect(errorHandler).toHaveBeenCalledTimes(1)
      expect(errorHandler.mock.calls[0][0]).toBe(bug)
      expect(wrapper.find('.is-checking').exists()).toBe(false)
      expect(passwordFields(wrapper)).toHaveLength(2)
    })

    it('shows the form of a link without a token', async () => {
      route.query = { email: 'jane@example.com' }
      const checkResetToken = vi.fn()

      const wrapper = await openPage(vi.fn(), vi.fn(), checkResetToken)

      expect(checkResetToken).not.toHaveBeenCalled()
      expect(passwordFields(wrapper)).toHaveLength(2)
    })
  })

  describe('once the link is dead', () => {
    it('offers a new link instead of the password form', async () => {
      route.query.type = 'new'
      const wrapper = await openPage(vi.fn(rejectDeadLink))

      await submitPasswords(wrapper)

      expect(wrapper.findAll('input[type="password"]')).toHaveLength(0)
      expect(wrapper.find('.error').text()).toBe(
        'login.reset_change_password_token_failed'
      )
      expect(wrapper.find('a.main-button').text()).toBe('login.send_new_link')
      expect(wrapper.findComponent(RouterLinkStub).text()).toBe(
        'login.back_to_login'
      )
    })

    it('sends a new link to the address of the link', async () => {
      const resetPassword = vi.fn()
      const wrapper = mountWithI18n(ResetChangePassword, {
        global: {
          plugins: [createPageStore(vi.fn(rejectDeadLink), resetPassword)],
          stubs: { RouterLink: RouterLinkStub }
        }
      })
      await flushPromises()
      await submitPasswords(wrapper)

      await wrapper.find('a.main-button').trigger('click')
      await flushPromises()

      expect(resetPassword).toHaveBeenCalledTimes(1)
      expect(resetPassword.mock.calls[0][1]).toBe('jane@example.com')
      expect(wrapper.find('a.main-button').exists()).toBe(false)
      expect(wrapper.find('.error').exists()).toBe(false)
      const message = wrapper.find('.success')
      expect(message.text()).toBe(
        'A new link was sent to: jane@example.com Please use the most recent email.'
      )
      // The page style puts this span on a line of its own.
      expect(message.find('.sent-address').text()).toBe('jane@example.com')
    })

    it('asks for one link while the request runs', async () => {
      const resetPassword = vi.fn(() => new Promise(() => {}))
      const wrapper = await openPage(vi.fn(rejectDeadLink), resetPassword)
      await submitPasswords(wrapper)
      const send = wrapper.find('a.main-button')

      await send.trigger('click')
      expect(send.classes()).toContain('is-loading')
      await send.trigger('keydown.enter')
      await send.trigger('click')

      expect(resetPassword).toHaveBeenCalledTimes(1)
    })

    it('asks again after a failed sending', async () => {
      const resetPassword = vi
        .fn()
        .mockRejectedValueOnce(requestFailure('down'))
        .mockResolvedValue()
      const wrapper = await openPage(vi.fn(rejectDeadLink), resetPassword)
      await submitPasswords(wrapper)
      const send = wrapper.find('a.main-button')

      await send.trigger('click')
      await flushPromises()
      expect(wrapper.findAll('.error').map(error => error.text())).toEqual([
        'login.reset_change_password_token_failed',
        'login.send_new_link_failed'
      ])
      // The focus stays on the button: screen readers learn it this way.
      expect(wrapper.find('[role="alert"]').text()).toBe(
        'login.send_new_link_failed'
      )
      await send.trigger('click')
      await flushPromises()

      expect(resetPassword).toHaveBeenCalledTimes(2)
      expect(wrapper.find('.error').exists()).toBe(false)
      expect(wrapper.find('.success').text()).toBe(
        'login.new_link_sent_to jane@example.com login.new_link_use_most_recent'
      )
    })

    it('leaves a bug of the sending to Sentry', async () => {
      const bug = new TypeError('a bug')
      const errorHandler = vi.fn()
      const wrapper = mountWithErrorHandler(
        errorHandler,
        vi.fn(rejectDeadLink),
        vi.fn(() => Promise.reject(bug))
      )
      await flushPromises()
      await submitPasswords(wrapper)

      await wrapper.find('a.main-button').trigger('click')
      await flushPromises()

      expect(errorHandler).toHaveBeenCalledTimes(1)
      expect(errorHandler.mock.calls[0][0]).toBe(bug)
      expect(wrapper.find('[role="alert"]').text()).toBe(
        'login.send_new_link_failed'
      )
    })

    it('keeps the focus on the page as the form and the button go', async () => {
      const wrapper = mount(ResetChangePassword, {
        attachTo: document.body,
        global: {
          plugins: [i18n, createPageStore(vi.fn(rejectDeadLink), vi.fn())],
          stubs: { RouterLink: RouterLinkStub }
        }
      })
      await flushPromises()
      await fillPasswords(wrapper)
      wrapper.find('a.main-button').element.focus()

      await wrapper.find('a.main-button').trigger('click')
      await flushPromises()
      expect(document.activeElement).toBe(wrapper.find('.error').element)
      // The focus reads the message: an alert would say it twice.
      expect(wrapper.find('.error').attributes('role')).toBeUndefined()

      wrapper.find('a.main-button').element.focus()
      await wrapper.find('a.main-button').trigger('click')
      await flushPromises()
      expect(document.activeElement).toBe(wrapper.find('.success').element)
      wrapper.unmount()
    })
  })
})
