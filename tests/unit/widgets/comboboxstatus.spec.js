import { createStore } from 'vuex'

import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'

import { shallowMountWithI18n } from '../fixtures/i18n'

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

    wrapper = shallowMountWithI18n(ComboboxStatus, {
      props: {
        taskStatusList,
        modelValue: 'status-2'
      },
      global: {
        plugins: [store]
      }
    })
  })

  it('displays current status short name', () => {
    expect(wrapper.find('.tag').text()).toBe('WIP')
  })

  it('names the combobox by its label, else by the given element', () => {
    const mountNamed = props =>
      shallowMountWithI18n(ComboboxStatus, {
        props: { taskStatusList, modelValue: 'status-2', ...props },
        global: { plugins: [store] }
      })
    const labeled = mountNamed({ label: 'Status' })
    const labelId = labeled.find('label').attributes('id')
    expect(labelId).toBeTruthy()
    expect(
      labeled.find('[role="combobox"]').attributes('aria-labelledby')
    ).toBe(labelId)
    expect(
      mountNamed({ ariaLabelledby: 'field-label' })
        .find('[role="combobox"]')
        .attributes('aria-labelledby')
    ).toBe('field-label')
    expect(
      wrapper.find('[role="combobox"]').attributes('aria-labelledby')
    ).toBeUndefined()
  })

  it('does not show the dropdown list initially', () => {
    expect(wrapper.find('.select-input').exists()).toBe(false)
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

  it('emits update:model-value when a status is selected', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const statusLines = wrapper.findAll('.status-line')
    await statusLines[2].trigger('click')
    expect(wrapper.emitted('update:model-value')).toBeTruthy()
    expect(wrapper.emitted('update:model-value')[0]).toEqual(['status-3'])
  })

  it('shows placeholder when no modelValue and addPlaceholder is true', () => {
    const w = shallowMountWithI18n(ComboboxStatus, {
      props: {
        taskStatusList,
        modelValue: '',
        addPlaceholder: true
      },
      global: { plugins: [store] }
    })
    expect(w.find('.tag').text()).toBe('+ Add Task Status')
  })

  it('shows the given placeholder as text, out of the list of statuses', async () => {
    const w = shallowMountWithI18n(ComboboxStatus, {
      props: {
        taskStatusList,
        modelValue: '',
        placeholder: 'Select a status'
      },
      global: { plugins: [store] }
    })
    expect(w.find('.selected-status-line').text()).toBe('Select a status')
    expect(w.find('.selected-status-line .tag').exists()).toBe(false)

    await w.find('.flexrow').trigger('click')

    expect(w.findAll('.status-line').map(line => line.text())).toEqual([
      'TODO',
      'WIP',
      'DONE'
    ])
    expect(w.find('[aria-selected="true"]').exists()).toBe(false)
  })

  it('shows the chosen status rather than the given placeholder', () => {
    const w = shallowMountWithI18n(ComboboxStatus, {
      props: {
        taskStatusList,
        modelValue: 'status-2',
        placeholder: 'Select a status'
      },
      global: { plugins: [store] }
    })
    expect(w.find('.selected-status-line').text()).toBe('WIP')
    expect(w.find('.selected-status-line .tag').text()).toBe('WIP')
  })

  it('falls back to first status when modelValue is empty and no placeholder', () => {
    const w = shallowMountWithI18n(ComboboxStatus, {
      props: {
        taskStatusList,
        modelValue: ''
      },
      global: { plugins: [store] }
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

  it('exposes combobox/listbox ARIA roles', async () => {
    const trigger = wrapper.find('.flexrow')
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('tabindex')).toBe('0')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.select-input').attributes('role')).toBe('listbox')
    expect(wrapper.findAll('.status-line')[0].attributes('role')).toBe(
      'option'
    )
  })

  it('opens the dropdown and selects an option via keyboard', async () => {
    const trigger = wrapper.find('.flexrow')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.find('.select-input').exists()).toBe(true)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:model-value')[0]).toEqual(['status-3'])
    expect(wrapper.find('.select-input').exists()).toBe(false)
  })

  it('closes the dropdown on Escape', async () => {
    const trigger = wrapper.find('.flexrow')
    await trigger.trigger('click')
    expect(wrapper.find('.select-input').exists()).toBe(true)
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.select-input').exists()).toBe(false)
  })
})
