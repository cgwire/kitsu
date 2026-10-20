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
  store.dispatch = vi.fn(async name => {
    const response = responses[name]
    return typeof response === 'function' ? response() : (response ?? null)
  })
  const wrapper = shallowMount(ProductionClients, {
    global: {
      plugins: [store],
      mocks: { $t: (k, p) => k + (p?.time || '') },
      // The client access sections live in this child: render it for real
      stubs: { ClientAccessSettings: false }
    }
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
    vi.restoreAllMocks()
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

  it('keeps the create button from a failed account load', async () => {
    const error = new Error('down')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await mountClients({
      responses: {
        getPreviewAccount: () => {
          throw error
        }
      }
    })
    expect(consoleError).toHaveBeenCalledWith(error)
    expect(wrapper.find('.preview .error').exists()).toBe(true)
    expect(wrapper.findComponent('.create-button').exists()).toBe(false)
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
    const error = new Error('boom')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    store.dispatch.mockRejectedValue(error)
    wrapper.findComponent(Checkbox).vm.$emit('change', true)
    await flushPromises()
    expect(consoleError).toHaveBeenCalledWith(error)
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

  it('shows an override equal to the studio value as the default', async () => {
    const { wrapper } = await mountClients({
      production: {
        id: 'prod-1',
        task_statuses_link: { s1: { priority: 1, is_client_allowed: true } }
      },
      getters: {
        productionTaskStatuses: () => [
          { id: 's1', name: 'Valid', priority: 5, is_client_allowed: true }
        ]
      }
    })
    expect(wrapper.find('.status-item').classes()).not.toContain(
      'is-overridden'
    )
    expect(wrapper.find('.statuses-reset').exists()).toBe(false)
  })

  it('lists every production status with its effective client value', async () => {
    const { wrapper, store } = await mountClients({
      production: {
        id: 'prod-1',
        task_statuses_link: {
          s1: { priority: 2, is_client_allowed: true },
          s2: { priority: 1, is_client_allowed: null }
        }
      },
      getters: {
        productionTaskStatuses: () => [
          { id: 's1', name: 'Todo', priority: 5, is_client_allowed: false },
          { id: 's2', name: 'Valid', priority: 5, is_client_allowed: true }
        ]
      }
    })
    const items = wrapper.findAll('.status-item')
    expect(items).toHaveLength(2)
    // Production order: s2 has the lower production priority
    expect(items[0].findComponent(ValidationTag).props('task')).toEqual({
      task_status_id: 's2'
    })
    const [valid, todo] = items
    expect(valid.findComponent('.status-client-allowed').props('modelValue')).toBe(true)
    expect(valid.classes()).not.toContain('is-overridden')
    expect(wrapper.find('.statuses-reset').exists()).toBe(true)
    expect(todo.findComponent('.status-client-allowed').props('modelValue')).toBe(true)
    expect(todo.classes()).toContain('is-overridden')

    // Back to the studio value (false) clears the override
    todo.findComponent('.status-client-allowed').vm.$emit('change', false)
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('setTaskStatusClientAllowed', {
      taskStatusId: 's1',
      isClientAllowed: null
    })
    // Away from the studio value (true) sets it for the production
    valid.findComponent('.status-client-allowed').vm.$emit('change', false)
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('setTaskStatusClientAllowed', {
      taskStatusId: 's2',
      isClientAllowed: false
    })
    store.dispatch.mockClear()
    await wrapper.find('.statuses-reset').trigger('click')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('setTaskStatusClientAllowed', {
      taskStatusId: 's1',
      isClientAllowed: null
    })
    // Statuses already on the studio value are not sent again
    expect(store.dispatch).not.toHaveBeenCalledWith(
      'setTaskStatusClientAllowed',
      { taskStatusId: 's2', isClientAllowed: null }
    )
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
    const error = new Error('boom')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    wrapper.findComponent('.delete-button').vm.$emit('click')
    store.dispatch.mockImplementation(async name => {
      if (name === 'deletePreviewAccount') throw error
      return account()
    })
    wrapper.findComponent(ConfirmModal).vm.$emit('confirm')
    await flushPromises()
    expect(consoleError).toHaveBeenCalledWith(error)
    expect(wrapper.findComponent(ConfirmModal).props('active')).toBe(true)
    expect(wrapper.findComponent(ConfirmModal).props('isError')).toBe(true)
  })

  describe('client access', () => {
    const flags = [
      ['stats', 'is_client_stats_visible'],
      ['task-list', 'is_client_task_list_visible'],
      ['task-panel', 'is_client_task_panel_visible']
    ]

    it('checks a flag that is null or missing, unchecks only false', async () => {
      const { wrapper } = await mountClients({
        production: {
          id: 'prod-1',
          is_client_stats_visible: null,
          is_client_task_list_visible: false
        }
      })
      const value = name =>
        wrapper.findComponent(`.access-${name}`).props('modelValue')
      expect(value('stats')).toBe(true)
      expect(value('task-list')).toBe(false)
      expect(value('task-panel')).toBe(true)
    })

    it.each(flags)('%s toggle dispatches editProduction', async (name, flag) => {
      const { wrapper, store } = await mountClients()
      wrapper.findComponent(`.access-${name}`).vm.$emit('change', false)
      await flushPromises()
      expect(store.dispatch).toHaveBeenCalledWith('editProduction', {
        id: 'prod-1',
        [flag]: false
      })
    })

    it('lists the task types and dispatches the visibility', async () => {
      const { wrapper, store } = await mountClients({
        production: {
          id: 'prod-1',
          task_type_links: { t2: { is_client_visible: false } }
        },
        getters: {
          productionTaskTypes: () => [
            { id: 't1', name: 'Concept', for_entity: 'Asset' },
            { id: 't2', name: 'Layout', for_entity: 'Shot' }
          ]
        }
      })
      const boxes = wrapper.findAllComponents('.access-task-type')
      expect(boxes).toHaveLength(2)
      expect(boxes[0].props('modelValue')).toBe(true)
      expect(boxes[1].props('modelValue')).toBe(false)
      boxes[1].vm.$emit('change', true)
      await flushPromises()
      expect(store.dispatch).toHaveBeenCalledWith(
        'setTaskTypeClientVisibility',
        { taskTypeId: 't2', isClientVisible: true }
      )
    })

    it('shows the hint only when the task list is off', async () => {
      const on = await mountClients()
      expect(on.wrapper.find('.access-task-list-hint').exists()).toBe(false)
      const off = await mountClients({
        production: { id: 'prod-1', is_client_task_list_visible: false }
      })
      expect(off.wrapper.find('.access-task-list-hint').exists()).toBe(true)
    })

    it('resets the checkbox on a save error', async () => {
      const { wrapper, store } = await mountClients()
      const error = new Error('boom')
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      store.dispatch.mockRejectedValue(error)
      const before = wrapper.findComponent('.access-stats')
      before.vm.$emit('change', false)
      await flushPromises()
      expect(consoleError).toHaveBeenCalledWith(error)
      expect(wrapper.find('.save-error').exists()).toBe(true)
      expect(before.exists()).toBe(false)
    })
  })
})
