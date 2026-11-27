import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PanelLayout from '@/components/layouts/PanelLayout.vue'

const mountLayout = (props = {}, slots = {}) =>
  mount(PanelLayout, {
    props,
    slots: {
      filters: '<p class="my-filters" />',
      list: '<p class="my-list" />',
      side: '<p class="my-side" />',
      ...slots
    }
  })

describe('PanelLayout', () => {
  it('lays the filters and the list in two panels of the main column', () => {
    const wrapper = mountLayout()

    const panels = wrapper.findAll('.main-column .page-panel')
    expect(panels).toHaveLength(2)
    expect(panels[0].classes()).toContain('filters-panel')
    expect(panels[0].find('.my-filters').exists()).toBe(true)
    expect(panels[1].classes()).toContain('list-panel')
    expect(panels[1].find('.my-list').exists()).toBe(true)
  })

  it('draws no filters panel for a page without filters', () => {
    const wrapper = mount(PanelLayout, {
      slots: { list: '<p class="my-list" />' }
    })

    expect(wrapper.find('.filters-panel').exists()).toBe(false)
  })

  it('lays the tabs of a page above its columns', () => {
    expect(mountLayout().find('.page-tabs').exists()).toBe(false)

    const wrapper = mountLayout({}, { tabs: '<p class="my-tabs" />' })

    expect(wrapper.classes()).toContain('with-tabs')
    expect(wrapper.find('.page-tabs .my-tabs').exists()).toBe(true)
    expect(wrapper.find('.page-tabs').element.parentElement).toBe(
      wrapper.element
    )
  })

  // TaskInfo resizes the element holding it when it is the side column.
  it('holds the side content right in its side column, when it has one', () => {
    expect(mountLayout().find('.side-column').exists()).toBe(false)

    const wrapper = mountLayout({ side: true })

    expect(wrapper.classes()).toContain('with-side')
    expect(wrapper.find('.my-side').element.parentElement.className).toBe(
      'column side-column'
    )
  })

  // Concepts keeps the task panel of the other pages: a full-height column.
  it('frames its side as a panel unless asked for the plain column', () => {
    expect(mountLayout({ side: true }).classes()).toContain('paneled-side')

    const wrapper = mountLayout({ plainSide: true, side: true })

    expect(wrapper.classes()).not.toContain('paneled-side')
  })

  it('marks a side shown in place of the list on phones', () => {
    const wrapper = mountLayout({ side: true, sideFocused: true })

    expect(wrapper.classes()).toContain('side-focused')
  })

  it('caps the width of its panels on request', () => {
    expect(mountLayout().find('.panels').attributes('style')).toBeUndefined()

    const wrapper = mountLayout({ maxWidth: 940 })

    expect(wrapper.find('.panels').element.style.maxWidth).toBe('940px')
  })

  it('renders what a page adds beside its columns', () => {
    const wrapper = mountLayout({}, { default: '<p class="my-backdrop" />' })

    expect(wrapper.find('.my-backdrop').element.parentElement).toBe(
      wrapper.element
    )
  })
})
