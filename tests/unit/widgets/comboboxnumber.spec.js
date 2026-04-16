import { shallowMount } from '@vue/test-utils'

import i18n from '@/lib/i18n'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'

import './setup'

describe('ComboboxNumber', () => {
  const options = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '5', value: 5 }
  ]

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ComboboxNumber, {
      props: { options, modelValue: 1 },
      global: { plugins: [i18n] }
    })
  })

  it('mounts successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders all options', () => {
    const optionEls = wrapper.findAll('option')
    expect(optionEls).toHaveLength(3)
  })

  it('emits update:modelValue as integer on change', async () => {
    const select = wrapper.find('select')
    select.element.value = '5'
    await select.trigger('change')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([5])
  })

  it('emits enter event as integer on keyup.enter', async () => {
    const select = wrapper.find('select')
    select.element.value = '2'
    await select.trigger('keyup.enter')
    expect(wrapper.emitted('enter')[0]).toEqual([2])
  })

  it('renders in field mode by default', () => {
    expect(wrapper.find('.field').exists()).toBe(true)
  })

  it('renders in simple mode when isSimple is true', () => {
    const w = shallowMount(ComboboxNumber, {
      props: { options, modelValue: 1, isSimple: true },
      global: { plugins: [i18n] }
    })
    expect(w.find('.field').exists()).toBe(false)
    expect(w.find('.select').exists()).toBe(true)
  })

  it('renders label when provided', async () => {
    await wrapper.setProps({ label: 'FPS' })
    expect(wrapper.find('label').text()).toBe('FPS')
  })

  it('hides label when empty', () => {
    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('disables select when disabled prop is true', async () => {
    await wrapper.setProps({ disabled: true })
    expect(wrapper.find('select').element.disabled).toBe(true)
  })
})
