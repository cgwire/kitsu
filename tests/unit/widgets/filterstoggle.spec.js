import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import FiltersToggle from '@/components/widgets/FiltersToggle.vue'

const mountToggle = props =>
  mount(FiltersToggle, {
    props,
    global: { mocks: { $t: key => key } }
  })

const buttonOf = (wrapper, name) =>
  wrapper.findAllComponents(ButtonSimple).find(button => button.classes(name))

describe('FiltersToggle', () => {
  it('offers to unfold the filters, with the count of those set out of sight', () => {
    const toggle = buttonOf(
      mountToggle({ count: 2, modelValue: false }),
      'filters-toggle'
    )

    expect(toggle.props()).toMatchObject({
      icon: 'plus',
      isOn: false,
      text: '2',
      title: 'main.more_filters'
    })
    expect(toggle.attributes('aria-expanded')).toBe('false')
  })

  it('offers to fold the filters once they show, and counts nothing at zero', () => {
    const toggle = buttonOf(
      mountToggle({ count: 0, modelValue: true }),
      'filters-toggle'
    )

    expect(toggle.props()).toMatchObject({
      icon: 'minus',
      isOn: true,
      text: '',
      title: 'main.less_filters'
    })
    expect(toggle.attributes('aria-expanded')).toBe('true')
  })

  it('keeps the icon a page gives it, folded or not', () => {
    const iconOf = modelValue =>
      buttonOf(
        mountToggle({ icon: 'funnel', modelValue }),
        'filters-toggle'
      ).props('icon')

    expect(iconOf(false)).toBe('funnel')
    expect(iconOf(true)).toBe('funnel')
  })

  it('toggles its model', async () => {
    const wrapper = mountToggle({ modelValue: false })

    await buttonOf(wrapper, 'filters-toggle').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('offers the reset only when there is something to clear', async () => {
    expect(buttonOf(mountToggle(), 'reset-filters')).toBeUndefined()

    const wrapper = mountToggle({ resettable: true })
    await buttonOf(wrapper, 'reset-filters').trigger('click')

    expect(buttonOf(wrapper, 'reset-filters').props('title')).toBe(
      'main.clear_filters'
    )
    expect(wrapper.emitted('reset')).toHaveLength(1)
  })
})
