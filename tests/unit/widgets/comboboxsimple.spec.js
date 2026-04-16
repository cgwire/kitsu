import { shallowMount } from '@vue/test-utils'

import i18n from '@/lib/i18n'
import ComboboxSimple from '@/components/widgets/ComboboxSimple.vue'

import './setup'

describe('ComboboxSimple', () => {
  const options = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Day', value: 'day' }
  ]

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ComboboxSimple, {
      props: { options, modelValue: 'week' },
      global: { plugins: [i18n] }
    })
  })

  it('mounts successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders all options as clickable spans', () => {
    const choices = wrapper.findAll('.choice')
    expect(choices).toHaveLength(3)
    expect(choices[0].text()).toBe('Week')
    expect(choices[1].text()).toBe('Month')
  })

  it('marks the matching option as selected on mount', () => {
    const choices = wrapper.findAll('.choice')
    expect(choices[0].classes()).toContain('selected')
    expect(choices[1].classes()).not.toContain('selected')
  })

  it('emits update:modelValue when an option is clicked', async () => {
    const choices = wrapper.findAll('.choice')
    await choices[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['month'])
  })

  it('updates selected state after clicking an option', async () => {
    const choices = wrapper.findAll('.choice')
    await choices[2].trigger('click')
    expect(choices[2].classes()).toContain('selected')
  })

  it('selects first option when modelValue does not match', async () => {
    const w = shallowMount(ComboboxSimple, {
      props: { options, modelValue: 'nonexistent' },
      global: { plugins: [i18n] }
    })
    await w.vm.$nextTick()
    const choices = w.findAll('.choice')
    expect(choices[0].classes()).toContain('selected')
  })

  it('resets selection when options change', async () => {
    const newOptions = [
      { label: 'Year', value: 'year' },
      { label: 'Quarter', value: 'quarter' }
    ]
    await wrapper.setProps({ options: newOptions })
    const choices = wrapper.findAll('.choice')
    expect(choices).toHaveLength(2)
    expect(choices[0].classes()).toContain('selected')
  })

  it('updates selection when modelValue changes', async () => {
    await wrapper.setProps({ modelValue: 'day' })
    const choices = wrapper.findAll('.choice')
    expect(choices[2].classes()).toContain('selected')
  })

  it('renders label when provided', async () => {
    await wrapper.setProps({ label: 'Period' })
    expect(wrapper.find('label').text()).toBe('Period')
  })

  it('hides label when empty', () => {
    expect(wrapper.find('label').exists()).toBe(false)
  })
})
