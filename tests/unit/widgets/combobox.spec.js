import { shallowMount } from '@vue/test-utils'

import i18n from '@/lib/i18n'
import Combobox from '@/components/widgets/Combobox.vue'

import './setup'

describe('Combobox', () => {
  const options = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' }
  ]

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Combobox, {
      props: { options, modelValue: 'a' },
      global: { plugins: [i18n] }
    })
  })

  it('mounts successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders all options', () => {
    const optionEls = wrapper.findAll('option')
    expect(optionEls).toHaveLength(3)
    expect(optionEls[0].text()).toBe('Option A')
    expect(optionEls[1].text()).toBe('Option B')
  })

  it('marks the selected option', () => {
    const optionEls = wrapper.findAll('option')
    expect(optionEls[0].element.selected).toBe(true)
    expect(optionEls[1].element.selected).toBe(false)
  })

  it('emits update:modelValue on change', async () => {
    const select = wrapper.find('select')
    select.element.value = 'Option B'
    await select.trigger('change')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['b'])
  })

  it('emits enter event on keyup.enter', async () => {
    const select = wrapper.find('select')
    select.element.value = 'Option A'
    await select.trigger('keyup.enter')
    expect(wrapper.emitted('enter')).toBeTruthy()
    expect(wrapper.emitted('enter')[0]).toEqual(['a'])
  })

  it('renders label when provided', async () => {
    await wrapper.setProps({ label: 'My Label' })
    expect(wrapper.find('label').text()).toBe('My Label')
  })

  it('hides label when empty', () => {
    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('disables select when disabled prop is true', async () => {
    await wrapper.setProps({ disabled: true })
    expect(wrapper.find('select').element.disabled).toBe(true)
  })

  it('applies error class when error prop is true', async () => {
    await wrapper.setProps({ error: true })
    expect(wrapper.find('select').classes()).toContain('error')
  })

  it('applies thin class when thin prop is true', async () => {
    await wrapper.setProps({ thin: true })
    expect(wrapper.find('select').classes()).toContain('thin')
  })

  it('applies width style when width prop is set', async () => {
    await wrapper.setProps({ width: 200 })
    expect(wrapper.find('select').element.style.width).toBe('200px')
  })

  it('renders separator hr when option has separator flag', () => {
    const wrapper2 = shallowMount(Combobox, {
      props: {
        options: [
          { label: 'A', value: 'a', separator: true },
          { label: 'B', value: 'b' }
        ],
        modelValue: 'a'
      },
      global: { plugins: [i18n] }
    })
    expect(wrapper2.findAll('hr')).toHaveLength(1)
  })

  it('adds field class with margin by default', () => {
    expect(wrapper.element.classList.contains('field')).toBe(true)
  })

  it('removes field class when withMargin is false', async () => {
    await wrapper.setProps({ withMargin: false })
    expect(wrapper.element.classList.contains('field')).toBe(false)
  })
})
