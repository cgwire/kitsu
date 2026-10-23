import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import Multiselect from 'vue-multiselect'
import { createStore } from 'vuex'

vi.mock('@/composables/modal', () => ({ useModal: () => {} }))

import SharePlaylistModal from '@/components/modals/SharePlaylistModal.vue'

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
})
