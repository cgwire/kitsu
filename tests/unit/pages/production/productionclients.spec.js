import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import ProductionClients from '@/components/pages/production/ProductionClients.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'

const iso = date => date.toISOString().slice(0, 19)
const inOneHour = () => iso(new Date(Date.now() + 3600 * 1000))

const mountClients = async ({ enabled = true, responses = {} } = {}) => {
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'prod-1' }),
      mainConfig: () => ({ preview_accounts_enabled: enabled })
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
    expect(wrapper.find('.password-value').text()).toBe('abc')
    expect(wrapper.find('.copy-button').exists()).toBe(true)
    expect(store.dispatch).toHaveBeenCalledWith('getPreviewAccount', 'prod-1')

    wrapper.findComponent('.open-button').vm.$emit('click')
    await flushPromises()
    expect(wrapper.find('.password-value').exists()).toBe(false)
  })

  it('shows open until time and block button when open', async () => {
    const { wrapper } = await mountClients({
      responses: { getPreviewAccount: account(inOneHour()) }
    })
    expect(wrapper.find('.status').text()).toContain('productions.clients.open_until')
    expect(wrapper.findComponent('.block-button').props('disabled')).toBe(false)
  })

  it('shows blocked when the window is past', async () => {
    const { wrapper } = await mountClients({
      responses: { getPreviewAccount: account('2000-01-01T00:00:00') }
    })
    expect(wrapper.find('.status').text()).toBe('productions.clients.blocked')
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
})
