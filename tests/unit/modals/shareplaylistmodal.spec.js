import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import Multiselect from 'vue-multiselect'
import { createStore } from 'vuex'

vi.mock('@/composables/modal', () => ({ useModal: () => {} }))

import SharePlaylistModal from '@/components/modals/SharePlaylistModal.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import DateField from '@/components/widgets/DateField.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const openInvite = async sendPlaylistShareInvitations => {
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1', team: [] }),
      personMap: () => new Map()
    },
    actions: {
      loadPlaylistShareLinks: () =>
        Promise.resolve([
          { id: 'link-1', token: 'token-1', can_comment: true }
        ]),
      sendPlaylistShareInvitations
    }
  })
  const wrapper = mount(SharePlaylistModal, {
    props: { active: true, playlist: { id: 'playlist-1' } },
    global: { plugins: [store, i18n] }
  })
  await flushPromises()
  await wrapper.find('.invite-button').trigger('click')
  return wrapper
}

const sendButton = wrapper => wrapper.find('.invite-actions button')

const openCreateForm = async (createPlaylistShareLink = () => {}) => {
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1', team: [] }),
      personMap: () => new Map()
    },
    actions: {
      createPlaylistShareLink,
      loadPlaylistShareLinks: () => Promise.resolve([])
    }
  })
  const wrapper = mount(SharePlaylistModal, {
    props: { active: true, playlist: { id: 'playlist-1' } },
    global: { plugins: [store, i18n], stubs: { DateField: true } }
  })
  await flushPromises()
  await wrapper.find('.add-row button').trigger('click')
  return wrapper
}

describe('modals/SharePlaylistModal', () => {
  it('cannot send an invitation without a recipient', async () => {
    const sendPlaylistShareInvitations = vi.fn()
    const wrapper = await openInvite(sendPlaylistShareInvitations)

    expect(sendButton(wrapper).element.disabled).toBe(true)
    await sendButton(wrapper).trigger('click')
    expect(sendPlaylistShareInvitations).not.toHaveBeenCalled()
  })

  it('sends the invitation once a recipient is added', async () => {
    const sendPlaylistShareInvitations = vi.fn(() =>
      Promise.resolve({ sent: ['client@example.com'] })
    )
    const wrapper = await openInvite(sendPlaylistShareInvitations)

    wrapper.findComponent(Multiselect).vm.$emit('tag', 'client@example.com')
    await flushPromises()
    expect(sendButton(wrapper).element.disabled).toBe(false)
    await sendButton(wrapper).trigger('click')
    await flushPromises()

    expect(sendPlaylistShareInvitations).toHaveBeenCalledTimes(1)
    expect(sendPlaylistShareInvitations.mock.calls[0][1]).toEqual({
      playlistId: 'playlist-1',
      token: 'token-1',
      data: { emails: ['client@example.com'], person_ids: [], message: null }
    })
  })

  it('leaves the create form on cancel and forgets its values', async () => {
    const wrapper = await openCreateForm()

    wrapper.findComponent(Checkbox).vm.$emit('update:model-value', false)
    await wrapper.find('.form-actions .cancel-button').trigger('click')
    expect(wrapper.find('.create-card').exists()).toBe(false)

    await wrapper.find('.add-row button').trigger('click')
    expect(wrapper.findComponent(Checkbox).props('modelValue')).toBe(true)
  })

  it('lets the date field follow the theme', async () => {
    const wrapper = await openCreateForm()

    expect(wrapper.findComponent(DateField).props('isDark')).toBe(false)
  })

  it('proposes an expiration date in 30 days', async () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 10, 3, 12) })
    const createPlaylistShareLink = vi.fn()
    const wrapper = await openCreateForm(createPlaylistShareLink)

    await wrapper.find('.form-actions .is-primary').trigger('click')
    await flushPromises()
    vi.useRealTimers()

    expect(createPlaylistShareLink.mock.calls[0][1].data.expiration_date).toBe(
      '2026-12-03'
    )
  })

  it('keeps the zip download off unless it is asked for', async () => {
    const createPlaylistShareLink = vi.fn()
    const wrapper = await openCreateForm(createPlaylistShareLink)

    await wrapper.find('.form-actions .is-primary').trigger('click')
    await flushPromises()
    expect(createPlaylistShareLink.mock.calls[0][1].data.can_download).toBe(
      false
    )

    await wrapper.find('.add-row button').trigger('click')
    wrapper
      .findAllComponents(Checkbox)[1]
      .vm.$emit('update:model-value', true)
    await wrapper.find('.form-actions .is-primary').trigger('click')
    await flushPromises()
    expect(createPlaylistShareLink.mock.calls[1][1].data.can_download).toBe(
      true
    )
  })
})
