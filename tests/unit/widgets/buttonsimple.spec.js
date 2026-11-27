import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

describe('ButtonSimple', () => {
  // Touch screens show the icon alone: the text, hidden from sight only,
  // stays the name of the button.
  it('keeps a responsive text for screen readers on touch screens', () => {
    const wrapper = mount(ButtonSimple, {
      props: { icon: 'plus', isResponsive: true, text: 'New shot' }
    })
    const text = wrapper.find('span')

    expect(text.text()).toBe('New shot')
    expect(text.classes()).toEqual(['visuallyhidden-touch'])
  })

  it('shows its text on every screen by default', () => {
    const wrapper = mount(ButtonSimple, {
      props: { icon: 'plus', text: 'New shot' }
    })

    expect(wrapper.find('span').classes()).toEqual([])
  })

  it('draws the Lucide briefcase for the briefcase icon', () => {
    const wrapper = mount(ButtonSimple, {
      props: { icon: 'briefcase', text: 'Day off' }
    })

    expect(wrapper.find('svg.lucide-briefcase').exists()).toBe(true)
  })
})
