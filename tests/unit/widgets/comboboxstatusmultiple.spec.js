import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'
import ComboboxStatusMultiple from '@/components/widgets/ComboboxStatusMultiple.vue'

const taskStatusList = [
  { id: 'status-1', name: 'Todo', short_name: 'todo', color: '#f5f5f5' },
  { id: 'status-2', name: 'Work In Progress', short_name: 'wip', color: '#3273dc' },
  { id: 'status-3', name: 'Done', short_name: 'done', color: '#22d160' }
]

const mountWidget = (props = {}) =>
  shallowMount(ComboboxStatusMultiple, {
    props: { taskStatusList, ...props },
    global: {
      plugins: [createStore({ getters: { isDarkTheme: () => false } })]
    }
  })

const combobox = wrapper => wrapper.findComponent(ComboboxOptions)

describe('ComboboxStatusMultiple', () => {
  it('lists every status and reads "all" when none is selected', () => {
    const wrapper = mountWidget()
    expect(combobox(wrapper).props()).toMatchObject({
      title: 'main.all',
      modelValue: { 'status-1': false, 'status-2': false, 'status-3': false }
    })
    expect(combobox(wrapper).props('options').map(o => o.value)).toEqual([
      'status-1',
      'status-2',
      'status-3'
    ])
  })

  it('names the only selected status', () => {
    const wrapper = mountWidget({ modelValue: ['status-2'] })
    expect(combobox(wrapper).props('title')).toBe('wip')
  })

  it('counts the selected statuses once there are several', () => {
    const wrapper = mountWidget({ modelValue: ['status-3', 'status-2'] })
    expect(combobox(wrapper).props('title')).toBe('(2/3)')
    expect(combobox(wrapper).props('modelValue')).toEqual({
      'status-1': false,
      'status-2': true,
      'status-3': true
    })
  })

  it('adds the status the user switches on', async () => {
    const wrapper = mountWidget({ modelValue: ['status-3'] })
    await combobox(wrapper).vm.$emit('change', { key: 'status-1', value: true })
    expect(wrapper.emitted('update:model-value')).toEqual([
      [['status-1', 'status-3']]
    ])
  })

  it('removes the status the user switches off', async () => {
    const wrapper = mountWidget({ modelValue: ['status-1', 'status-3'] })
    await combobox(wrapper).vm.$emit('change', {
      key: 'status-1',
      value: false
    })
    expect(wrapper.emitted('update:model-value')).toEqual([[['status-3']]])
  })

  it('labels the field when asked to', () => {
    expect(mountWidget().find('label').exists()).toBe(false)
    expect(mountWidget({ label: 'Status' }).find('label').text()).toBe(
      'Status'
    )
  })
})
