import { shallowMount } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'
import ComboboxVisibleOptions from '@/components/widgets/ComboboxVisibleOptions.vue'

const options = [
  { label: 'Characters', value: 'chars' },
  { label: 'Props', value: 'props' }
]

const mountWidget = (props = {}) =>
  shallowMount(ComboboxVisibleOptions, { props: { options, ...props } })

const combobox = wrapper => wrapper.findComponent(ComboboxOptions)

describe('ComboboxVisibleOptions', () => {
  it('shows every option as visible by default', () => {
    const wrapper = mountWidget()
    expect(combobox(wrapper).props()).toMatchObject({
      title: 'main.all',
      options,
      modelValue: { chars: true, props: true }
    })
  })

  it('counts the visible options once some are hidden', () => {
    const wrapper = mountWidget({ hidden: ['props'] })
    expect(combobox(wrapper).props('title')).toBe('(1/2)')
    expect(combobox(wrapper).props('modelValue')).toEqual({
      chars: true,
      props: false
    })
  })

  // A link can carry ids of options the current list does not have.
  it('ignores the hidden values that match no option', () => {
    const wrapper = mountWidget({ hidden: ['vehicles'] })
    expect(combobox(wrapper).props('title')).toBe('main.all')
  })

  it('hides the option the user switches off', async () => {
    const wrapper = mountWidget({ hidden: ['props'] })
    await combobox(wrapper).vm.$emit('change', { key: 'chars', value: false })
    expect(wrapper.emitted('update:hidden')).toEqual([[['props', 'chars']]])
  })

  it('shows again the option the user switches on', async () => {
    const wrapper = mountWidget({ hidden: ['props'] })
    await combobox(wrapper).vm.$emit('change', { key: 'props', value: true })
    expect(wrapper.emitted('update:hidden')).toEqual([[[]]])
  })

  it('labels the field when asked to', () => {
    expect(mountWidget().find('label').exists()).toBe(false)
    expect(mountWidget({ label: 'Asset types' }).find('label').text()).toBe(
      'Asset types'
    )
  })
})
