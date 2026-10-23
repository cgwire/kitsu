import { shallowMount } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import ComboboxMultiple from '@/components/widgets/ComboboxMultiple.vue'
import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'

const options = [
  { label: 'Characters', value: 'chars' },
  { label: 'Props', value: 'props' },
  { label: 'Sets', value: 'sets' }
]

const mountWidget = (props = {}) =>
  shallowMount(ComboboxMultiple, { props: { options, ...props } })

const combobox = wrapper => wrapper.findComponent(ComboboxOptions)

describe('ComboboxMultiple', () => {
  it('reads "all" when nothing is selected', () => {
    const wrapper = mountWidget()
    expect(combobox(wrapper).props()).toMatchObject({
      title: 'main.all',
      options,
      modelValue: { chars: false, props: false, sets: false }
    })
  })

  it('names the only selected option', () => {
    const wrapper = mountWidget({ modelValue: ['sets'] })
    expect(combobox(wrapper).props('title')).toBe('Sets')
  })

  it('counts the selected options once there are several', () => {
    const wrapper = mountWidget({ modelValue: ['sets', 'chars'] })
    expect(combobox(wrapper).props('title')).toBe('(2/3)')
  })

  it('adds the option the user switches on', async () => {
    const wrapper = mountWidget({ modelValue: ['sets'] })
    await combobox(wrapper).vm.$emit('change', { key: 'chars', value: true })
    expect(wrapper.emitted('update:model-value')).toEqual([
      [['chars', 'sets']]
    ])
  })

  it('removes the option the user switches off', async () => {
    const wrapper = mountWidget({ modelValue: ['chars', 'sets'] })
    await combobox(wrapper).vm.$emit('change', { key: 'chars', value: false })
    expect(wrapper.emitted('update:model-value')).toEqual([[['sets']]])
  })

  it('labels the field when asked to', () => {
    expect(mountWidget().find('label').exists()).toBe(false)
    expect(mountWidget({ label: 'Asset type' }).find('label').text()).toBe(
      'Asset type'
    )
  })
})
