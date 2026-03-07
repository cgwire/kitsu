import { shallowMount } from '@vue/test-utils'

import i18n from '@/lib/i18n'
import ComboboxTag from '@/components/widgets/ComboboxTag.vue'

import './setup'

describe('ComboboxTag', () => {
  const options = [
    { id: '1', label: 'Banana', value: 'banana' },
    { id: '2', label: 'Apple', value: 'apple' },
    { id: '3', label: 'Cherry', value: 'cherry' }
  ]

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ComboboxTag, {
      props: { options, modelValue: 'apple,cherry' },
      global: { plugins: [i18n] }
    })
  })

  it('mounts successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays selected values as comma-separated sorted text', () => {
    const selectedLine = wrapper.find('.selected-line')
    expect(selectedLine.text()).toBe('apple, cherry')
  })

  it('does not show the dropdown initially', () => {
    expect(wrapper.find('.select-input').exists()).toBe(false)
  })

  it('shows the dropdown on click', async () => {
    await wrapper.find('.flexrow').trigger('click')
    expect(wrapper.find('.select-input').exists()).toBe(true)
  })

  it('renders checkboxes for all options', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes).toHaveLength(3)
  })

  it('checks boxes matching selected values', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    const checked = checkboxes.filter(cb => cb.element.checked)
    expect(checked).toHaveLength(2)
  })

  it('emits update:modelValue when an unchecked option is clicked', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    // options are sorted by value: apple, banana, cherry
    const bananaOption = optionLines.find(
      o => o.text().trim().includes('Banana')
    )
    await bananaOption.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emittedValue = wrapper.emitted('update:modelValue')[0][0]
    expect(emittedValue).toContain('banana')
    expect(emittedValue).toContain('apple')
    expect(emittedValue).toContain('cherry')
  })

  it('emits update:modelValue removing a checked option on click', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    const appleOption = optionLines.find(
      o => o.text().trim().includes('Apple')
    )
    await appleOption.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emittedValue = wrapper.emitted('update:modelValue')[0][0]
    expect(emittedValue).not.toContain('apple')
    expect(emittedValue).toContain('cherry')
  })

  it('also emits change event on selection', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    await optionLines[0].trigger('click')
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('does not select when disabled', async () => {
    await wrapper.setProps({ disabled: true })
    await wrapper.find('.flexrow').trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    await optionLines[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('renders label when provided', async () => {
    await wrapper.setProps({ label: 'Tags' })
    expect(wrapper.find('label').text()).toBe('Tags')
  })

  it('hides label when empty', () => {
    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('shows empty text when no values selected', () => {
    const w = shallowMount(ComboboxTag, {
      props: { options, modelValue: '' },
      global: { plugins: [i18n] }
    })
    expect(w.find('.selected-line').text()).toBe('')
  })
})
