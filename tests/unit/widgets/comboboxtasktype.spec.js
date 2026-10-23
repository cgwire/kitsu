import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import i18n from '@/lib/i18n'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'

import './setup'

describe('ComboboxTaskType', () => {
  let store, wrapper

  const taskTypeList = [
    { id: 'tt-1', name: 'Modeling', color: '#ECECEC' },
    { id: 'tt-2', name: 'Animation', color: '#22D160' },
    { id: 'tt-3', name: 'Rigging', color: '#4ABB56' }
  ]

  beforeEach(() => {
    store = createStore({
      strict: true,
      getters: {
        isDarkTheme: () => false,
        taskTypeMap: () => new Map(taskTypeList.map(tt => [tt.id, tt]))
      }
    })

    wrapper = shallowMount(ComboboxTaskType, {
      props: {
        taskTypeList,
        modelValue: 'tt-2'
      },
      global: {
        plugins: [i18n, store],
        // The option list renders through <teleport to="body">; shallowMount
        // stubs it out by default, so opt back into the real teleport.
        stubs: { teleport: false }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  // The option list renders through <teleport to="body">, so it lands
  // outside wrapper.element and has to be queried on the real document.
  const findTeleportedList = () => document.querySelector('.select-input')

  it('exposes combobox/listbox ARIA roles', async () => {
    const trigger = wrapper.find('.flexrow.selector')
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('tabindex')).toBe('0')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(findTeleportedList().getAttribute('role')).toBe('listbox')
  })

  it('opens and selects a task type via keyboard', async () => {
    const trigger = wrapper.find('.flexrow.selector')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:model-value')[0]).toEqual(['tt-3'])
  })

  it('closes on Escape', async () => {
    const trigger = wrapper.find('.flexrow.selector')
    await trigger.trigger('click')
    expect(findTeleportedList()).not.toBeNull()
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(findTeleportedList()).toBeNull()
  })

  it('removes the trigger from tab order when disabled', async () => {
    await wrapper.setProps({ disabled: true })
    const trigger = wrapper.find('.flexrow.selector')
    expect(trigger.attributes('tabindex')).toBe('-1')
  })

  it('does not open when disabled', async () => {
    await wrapper.setProps({ disabled: true })
    const trigger = wrapper.find('.flexrow.selector')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(findTeleportedList()).toBeNull()
  })
})
