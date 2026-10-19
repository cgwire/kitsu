import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import ProductionClients from '@/components/pages/production/ProductionClients.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

const iso = date => date.toISOString().slice(0, 19)
const inOneHour = () => iso(new Date(Date.now() + 3600 * 1000))

const mountClients = async ({
  enabled = true,
  responses = {},
  production = { id: 'prod-1' },
  getters = {}
} = {}) => {
  const store = createStore({
    getters: {
      currentProduction: () => production,
      mainConfig: () => ({ preview_accounts_enabled: enabled }),
      ...getters
    }
  })
  store.dispatch = vi.fn(async name => responses[name] ?? null)
  const wrapper = shallowMount(ProductionClients, {
    global: { plugins: [store], mocks: { $t: (k, p) => k + (p?.time || '') } }
  })
  await flushPromises()
  return { wrapper, store }
}

const account = (until = null) => ({
  id: 'a1',
  email: 'preview@example.com',
  preview_open_until: until
})

describe('ProductionClients', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows create button when no account', async () => {
    const { wrapper } = await mountClients()
    expect(wrapper.find('.create-button').exists()).toBe(true)
  })

  it('shows password once after creation', async () => {
    const { wrapper, store } = await mountClients({
      responses: { createPreviewAccount: { ...account(), password: 'abc' } }
    })
    store.dispatch.mockImplementation(async name =>
      name === 'createPreviewAccount'
        ? { ...account(), password: 'abc' }
        : account()
    )
    wrapper.findComponent('.create-button').vm.$emit('click')
    await flushPromises()
    expect(wrapper.findComponent('.password-value').props('modelValue')).toBe('abc')
    expect(wrapper.find('.copy-password').exists()).toBe(true)
    expect(store.dispatch).toHaveBeenCalledWith('getPreviewAccount', 'prod-1')

    wrapper.findComponent('.open-button').vm.$emit('click')
    await flushPromises()
    expect(wrapper.find('.password-value').exists()).toBe(false)
  })

  it('shows open until time and block button when open', async () => {
    const { wrapper } = await mountClients({
      responses: { getPreviewAccount: account(inOneHour()) }
    })
    expect(wrapper.find('.state-tag').text()).toContain('productions.clients.open_until')
    expect(wrapper.findComponent('.block-button').exists()).toBe(true)
  })

  it('flips to blocked once the window expires', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
    const { wrapper } = await mountClients({
      responses: { getPreviewAccount: account(inOneHour()) }
    })
    expect(wrapper.find('.state-tag').text()).toContain('productions.clients.open_until')
    vi.advanceTimersByTime(61 * 60 * 1000)
    await nextTick()
    expect(wrapper.find('.state-tag').text()).toBe('productions.clients.blocked')
    expect(wrapper.findComponent('.block-button').exists()).toBe(false)
  })

  it('shows blocked when the window is past', async () => {
    const { wrapper } = await mountClients({
      responses: { getPreviewAccount: account('2000-01-01T00:00:00') }
    })
    expect(wrapper.find('.state-tag').text()).toBe('productions.clients.blocked')
    expect(wrapper.findComponent('.block-button').exists()).toBe(false)
  })

  it('copies the email with an icon button', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })
    const { wrapper } = await mountClients({
      responses: { getPreviewAccount: account('2000-01-01T00:00:00') }
    })
    expect(wrapper.findComponent('.email').props('modelValue')).toBe(
      account('2000-01-01T00:00:00').email
    )
    await wrapper.find('.copy-email').trigger('click')
    expect(writeText).toHaveBeenCalledWith(account('2000-01-01T00:00:00').email)
  })

  it('open and block dispatch setPreviewAccountOpen', async () => {
    const { wrapper, store } = await mountClients({
      responses: { getPreviewAccount: account(inOneHour()) }
    })
    wrapper.findComponent('.open-button').vm.$emit('click')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('setPreviewAccountOpen', {
      productionId: 'prod-1',
      isOpen: true
    })
    wrapper.findComponent('.block-button').vm.$emit('click')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('setPreviewAccountOpen', {
      productionId: 'prod-1',
      isOpen: false
    })
  })

  it('delete asks confirmation before dispatching', async () => {
    const { wrapper, store } = await mountClients({
      responses: { getPreviewAccount: account() }
    })
    wrapper.findComponent('.delete-button').vm.$emit('click')
    await flushPromises()
    expect(store.dispatch).not.toHaveBeenCalledWith(
      'deletePreviewAccount',
      'prod-1'
    )
    expect(wrapper.findComponent(ConfirmModal).props('active')).toBe(true)
    wrapper.findComponent(ConfirmModal).vm.$emit('confirm')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('deletePreviewAccount', 'prod-1')
  })

  it('shows disabled explanation when preview_accounts_enabled is false', async () => {
    const { wrapper } = await mountClients({ enabled: false })
    expect(wrapper.find('.unavailable').exists()).toBe(true)
    expect(wrapper.findAllComponents(ButtonSimple)).toHaveLength(0)
  })

  it('isolation toggle dispatches editProduction with is_clients_isolated', async () => {
    const { wrapper, store } = await mountClients()
    wrapper.findComponent(Checkbox).vm.$emit('change', true)
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('editProduction', {
      id: 'prod-1',
      is_clients_isolated: true
    })
  })

  it('shows a save error when editProduction fails', async () => {
    const { wrapper, store } = await mountClients()
    store.dispatch.mockRejectedValue(new Error('boom'))
    wrapper.findComponent(Checkbox).vm.$emit('change', true)
    await flushPromises()
    expect(wrapper.find('.save-error').exists()).toBe(true)
    expect(wrapper.find('.preview .error').exists()).toBe(false)
  })

  it('renders the other sections when preview accounts are disabled', async () => {
    const { wrapper } = await mountClients({ enabled: false })
    expect(wrapper.find('.isolation').exists()).toBe(true)
    expect(wrapper.find('.statuses').exists()).toBe(true)
    expect(wrapper.find('.metadata').exists()).toBe(true)
    expect(wrapper.find('.team-clients').exists()).toBe(true)
  })

  it('lists only statuses with is_client_allowed', async () => {
    const { wrapper } = await mountClients({
      getters: {
        productionTaskStatuses: () => [
          { id: 's1', name: 'Todo', is_client_allowed: false },
          { id: 's2', name: 'Valid', is_client_allowed: true }
        ]
      }
    })
    const items = wrapper.findAll('.status-item')
    expect(items).toHaveLength(1)
    expect(items[0].findComponent(ValidationTag).props('task')).toEqual({
      task_status_id: 's2'
    })
    expect(wrapper.find('.statuses input').exists()).toBe(false)
  })

  it('metadata toggle sends the full descriptor', async () => {
    const descriptor = {
      id: 'd1',
      name: 'Notes',
      entity_type: 'Asset',
      data_type: 'list',
      choices: ['a', 'b'],
      departments: [],
      for_client: false
    }
    const { wrapper, store } = await mountClients({
      getters: { assetMetadataDescriptors: () => [descriptor] }
    })
    wrapper
      .findAllComponents(Checkbox)
      .find(c => c.props('label').startsWith('Notes'))
      .vm.$emit('change', true)
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('addMetadataDescriptor', {
      ...descriptor,
      values: descriptor.choices,
      for_client: true
    })
  })

  it('team clients skips ids missing from personMap', async () => {
    const { wrapper } = await mountClients({
      production: { id: 'prod-1', team: ['c1', 'preview-1', 'a1'] },
      getters: {
        personMap: () =>
          new Map([
            ['c1', { id: 'c1', full_name: 'Cli', role: 'client' }],
            ['a1', { id: 'a1', full_name: 'Art', role: 'client' }]
          ]),
        productionTeamRoles: () => ({ a1: 'user' })
      }
    })
    const rows = wrapper.findAll('.team-client')
    expect(rows).toHaveLength(1)
    expect(rows[0].findComponent(PeopleName).props('person').full_name).toBe(
      'Cli'
    )
  })

  it('keeps the delete modal open on failure', async () => {
    const { wrapper, store } = await mountClients({
      responses: { getPreviewAccount: account() }
    })
    wrapper.findComponent('.delete-button').vm.$emit('click')
    store.dispatch.mockImplementation(async name => {
      if (name === 'deletePreviewAccount') throw new Error('boom')
      return account()
    })
    wrapper.findComponent(ConfirmModal).vm.$emit('confirm')
    await flushPromises()
    expect(wrapper.findComponent(ConfirmModal).props('active')).toBe(true)
    expect(wrapper.findComponent(ConfirmModal).props('isError')).toBe(true)
  })

  it('shows the task status link to admins only', async () => {
    const admin = await mountClients({
      getters: { isCurrentUserAdmin: () => true }
    })
    expect(admin.wrapper.find('.statuses a, .statuses router-link').exists()).toBe(
      true
    )
    const manager = await mountClients({
      getters: { isCurrentUserAdmin: () => false }
    })
    expect(
      manager.wrapper.find('.statuses a, .statuses router-link').exists()
    ).toBe(false)
  })
})
