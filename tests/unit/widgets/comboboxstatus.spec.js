import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import i18n from '@/lib/i18n'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'

import './setup'

describe('ComboboxStatus', () => {
  let store, wrapper

  const taskStatusList = [
    {
      id: 'status-1',
      name: 'Todo',
      short_name: 'TODO',
      color: '#ECECEC'
    },
    {
      id: 'status-2',
      name: 'Work In Progress',
      short_name: 'WIP',
      color: '#22D160'
    },
    {
      id: 'status-3',
      name: 'Done',
      short_name: 'DONE',
      color: '#4ABB56'
    }
  ]

  beforeEach(() => {
    store = createStore({
      strict: true,
      getters: {
        isDarkTheme: () => false,
        productionMap: () => new Map(),
        taskStatusMap: () =>
          new Map(taskStatusList.map(s => [s.id, s]))
      }
    })

    wrapper = shallowMount(ComboboxStatus, {
      props: {
        taskStatusList,
        modelValue: 'status-2'
      },
      global: {
        plugins: [i18n, store]
      }
    })
  })

  it('mounts successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays current status short name', () => {
    expect(wrapper.find('.tag').text()).toBe('WIP')
  })

  it('does not show the dropdown list initially', () => {
    expect(wrapper.find('.select-input').exists()).toBe(false)
  })

  it('shows the dropdown list on click', async () => {
    await wrapper.find('.flexrow').trigger('click')
    expect(wrapper.find('.select-input').exists()).toBe(true)
  })

  it('renders all statuses in the dropdown', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const statusLines = wrapper.findAll('.status-line')
    expect(statusLines).toHaveLength(3)
  })

  it('closes dropdown after selecting a status', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const statusLines = wrapper.findAll('.status-line')
    await statusLines[2].trigger('click')
    expect(wrapper.find('.select-input').exists()).toBe(false)
  })

  it('emits update:modelValue when a status is selected', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const statusLines = wrapper.findAll('.status-line')
    await statusLines[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['status-3'])
  })

  it('shows placeholder when no modelValue and addPlaceholder is true', () => {
    const w = shallowMount(ComboboxStatus, {
      props: {
        taskStatusList,
        modelValue: '',
        addPlaceholder: true
      },
      global: { plugins: [i18n, store] }
    })
    expect(w.find('.tag').exists()).toBe(true)
  })

  it('falls back to first status when modelValue is empty and no placeholder', () => {
    const w = shallowMount(ComboboxStatus, {
      props: {
        taskStatusList,
        modelValue: ''
      },
      global: { plugins: [i18n, store] }
    })
    expect(w.find('.tag').text()).toBe('TODO')
  })

  it('applies background color from status', () => {
    const tag = wrapper.find('.tag')
    expect(tag.element.style.background).toBeTruthy()
  })

  it('renders label when provided', async () => {
    await wrapper.setProps({ label: 'Status' })
    expect(wrapper.find('label').text()).toBe('Status')
  })
})
