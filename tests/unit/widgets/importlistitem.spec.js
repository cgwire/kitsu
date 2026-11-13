import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ImportListItem from '@/components/widgets/ImportListItem.vue'

const mountItem = () =>
  mount(ImportListItem, { slots: { default: '<span>Character</span>' } })

describe('ImportListItem', () => {
  it('shows its content with an add icon', () => {
    const wrapper = mountItem()

    expect(wrapper.text()).toBe('Character')
    expect(wrapper.find('.add-icon').exists()).toBe(true)
    wrapper.unmount()
  })

  it('is a button that the keyboard reaches', () => {
    const wrapper = mountItem()

    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })

  it('tells in a tooltip that a click adds the item', () => {
    const wrapper = mountItem()

    expect(wrapper.attributes('title')).toBe('main.click_to_add')
    wrapper.unmount()
  })

  it('asks to add the item on a click, Enter, or Space', async () => {
    const wrapper = mountItem()

    await wrapper.trigger('click')
    await wrapper.trigger('keydown', { key: 'Enter' })
    await wrapper.trigger('keydown', { key: ' ' })
    await wrapper.trigger('keydown', { key: 'a' })

    expect(wrapper.emitted('add')).toHaveLength(3)
    wrapper.unmount()
  })
})
