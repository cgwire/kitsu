import { shallowMount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

import i18n from '@/lib/i18n'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'

import './setup'

const router = createRouter({
  history: createWebHistory(),
  routes: []
})

describe('ComboboxStyled', () => {
  const options = [
    { label: 'Version 1', value: 'v1' },
    { label: 'Version 2', value: 'v2' },
    { label: 'Version 3', value: 'v3' }
  ]

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ComboboxStyled, {
      props: { options, modelValue: 'v1' },
      global: { plugins: [i18n, router] }
    })
  })

  it('mounts successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the selected option label', () => {
    expect(wrapper.find('.selected-line').text()).toBe('Version 1')
  })

  it('does not show the dropdown list initially', () => {
    expect(wrapper.find('.select-input').exists()).toBe(false)
  })

  it('shows the dropdown list on click', async () => {
    await wrapper.find('.combo').trigger('click')
    expect(wrapper.find('.select-input').exists()).toBe(true)
  })

  it('renders all options in the dropdown', async () => {
    await wrapper.find('.combo').trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    expect(optionLines).toHaveLength(3)
  })

  it('hides dropdown after clicking the combo again', async () => {
    await wrapper.find('.combo').trigger('click')
    expect(wrapper.find('.select-input').exists()).toBe(true)
    await wrapper.find('.combo').trigger('click')
    expect(wrapper.find('.select-input').exists()).toBe(false)
  })

  it('emits update:modelValue and change when an option is selected', async () => {
    await wrapper.find('.combo').trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    await optionLines[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['v2'])
    expect(wrapper.emitted('change')[0]).toEqual(['v2'])
  })

  it('updates selected option when modelValue changes', async () => {
    await wrapper.setProps({ modelValue: 'v3' })
    expect(wrapper.find('.selected-line').text()).toBe('Version 3')
  })

  it('selects first option when modelValue does not match', () => {
    const w = shallowMount(ComboboxStyled, {
      props: { options, modelValue: 'nonexistent' },
      global: { plugins: [i18n, router] }
    })
    expect(w.find('.selected-line').text()).toBe('Version 1')
  })

  it('reverses options when isReversed is true', async () => {
    await wrapper.setProps({ isReversed: true })
    await wrapper.find('.combo').trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    expect(optionLines[0].text().trim()).toBe('Version 3')
    expect(optionLines[2].text().trim()).toBe('Version 1')
  })

  it('keeps order when isReversed and keepOrder are both true', async () => {
    await wrapper.setProps({ isReversed: true, keepOrder: true })
    await wrapper.find('.combo').trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    expect(optionLines[0].text().trim()).toBe('Version 1')
  })

  it('hides selected-line in compact mode', async () => {
    await wrapper.setProps({ isCompact: true })
    expect(wrapper.find('.selected-line').exists()).toBe(false)
  })

  it('renders label when provided', async () => {
    await wrapper.setProps({ label: 'Revision' })
    expect(wrapper.find('label').text()).toBe('Revision')
  })

  it('applies disabled attribute', async () => {
    await wrapper.setProps({ disabled: true })
    expect(wrapper.element.getAttribute('disabled')).not.toBeNull()
  })

  it('shows validation status indicator for validated options', async () => {
    const validatedOptions = [
      { label: 'V1', value: 'v1', validation_status: 'validated' }
    ]
    await wrapper.setProps({ options: validatedOptions, modelValue: 'v1' })
    expect(wrapper.find('.preview-status').exists()).toBe(true)
  })

  it('shows c-mask when dropdown is open', async () => {
    await wrapper.find('.combo').trigger('click')
    expect(wrapper.find('.c-mask.is-active').exists()).toBe(true)
  })
})
