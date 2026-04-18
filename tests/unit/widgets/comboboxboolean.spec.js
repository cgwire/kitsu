import { shallowMount } from '@vue/test-utils'

import i18n from '@/lib/i18n'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'

import './setup'

describe('ComboboxBoolean', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ComboboxBoolean, {
      props: { modelValue: 'true' },
      global: { plugins: [i18n] }
    })
  })

  it('mounts successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a Combobox child component', () => {
    const combobox = wrapper.findComponent({ name: 'Combobox' })
    expect(combobox.exists()).toBe(true)
  })

  it('passes boolean options (yes/no) to the inner combobox', () => {
    const combobox = wrapper.findComponent({ name: 'Combobox' })
    const options = combobox.props('options')
    expect(options).toHaveLength(2)
    expect(options[0].value).toBe('true')
    expect(options[1].value).toBe('false')
  })

  it('has non-empty labels on options', () => {
    const combobox = wrapper.findComponent({ name: 'Combobox' })
    const options = combobox.props('options')
    expect(options[0].label).toBeTruthy()
    expect(options[1].label).toBeTruthy()
    expect(options[0].label.length).toBeGreaterThan(0)
    expect(options[1].label.length).toBeGreaterThan(0)
  })

  it('forwards modelValue to inner combobox', () => {
    const combobox = wrapper.findComponent({ name: 'Combobox' })
    expect(combobox.props('modelValue')).toBe('true')
  })

  it('emits update:modelValue when inner combobox changes', async () => {
    const combobox = wrapper.findComponent({ name: 'Combobox' })
    await combobox.vm.$emit('update:modelValue', 'false')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['false'])
  })

  it('emits enter event when inner combobox emits enter', async () => {
    const combobox = wrapper.findComponent({ name: 'Combobox' })
    await combobox.vm.$emit('enter', 'true')
    expect(wrapper.emitted('enter')[0]).toEqual(['true'])
  })

  it('passes disabled prop to inner combobox', async () => {
    await wrapper.setProps({ disabled: true })
    const combobox = wrapper.findComponent({ name: 'Combobox' })
    expect(combobox.props('disabled')).toBe(true)
  })

  it('passes label prop to inner combobox', async () => {
    await wrapper.setProps({ label: 'Active' })
    const combobox = wrapper.findComponent({ name: 'Combobox' })
    expect(combobox.props('label')).toBe('Active')
  })
})
