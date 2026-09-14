import { flushPromises, shallowMount } from '@vue/test-utils'

import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'

import './setup'

describe('ComboboxOptions', () => {
  const options = [
    { label: 'Show infos', value: 'showInfos' },
    { label: 'Big thumbnails', value: 'bigThumbnails' },
    { label: 'Show assignations', value: 'showAssignations' }
  ]

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ComboboxOptions, {
      props: {
        title: 'Display options',
        options,
        modelValue: { showInfos: true }
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exposes combobox/listbox ARIA roles with multiselectable', async () => {
    const trigger = wrapper.find('.flexrow')
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('tabindex')).toBe('0')
    await trigger.trigger('click')
    const list = wrapper.find('.select-input')
    expect(list.attributes('role')).toBe('listbox')
    expect(list.attributes('aria-multiselectable')).toBe('true')
  })

  it('marks the checked option as aria-selected', async () => {
    const trigger = wrapper.find('.flexrow')
    await trigger.trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    expect(optionLines[0].attributes('aria-selected')).toBe('true')
    expect(optionLines[1].attributes('aria-selected')).toBe('false')
  })

  it('toggles the active option on Enter via keyboard', async () => {
    const trigger = wrapper.find('.flexrow')
    // 1st ArrowDown opens, the next two move the cursor to index 1
    // (bigThumbnails).
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:model-value')[0]).toEqual([
      { showInfos: true, bigThumbnails: true }
    ])
    // Multi-select: the list stays open after a selection.
    expect(wrapper.find('.select-input').exists()).toBe(true)
  })

  it('keeps the list open after selecting via keyboard', async () => {
    const trigger = wrapper.find('.flexrow')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('.select-input').exists()).toBe(true)
  })

  it('aligns the list on the right when it would overflow, on every open', async () => {
    // jsdom has no layout: only a left-aligned list overflows, a flipped one
    // fits. Without a reset the reopened list is measured flipped and
    // wrongly moves back to the left.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function () {
        const overflows = !this.classList.contains('align-right')
        return { right: window.innerWidth + (overflows ? 1 : -1) }
      }
    )
    const trigger = wrapper.find('.flexrow')
    await trigger.trigger('click')
    await flushPromises()
    expect(wrapper.find('.select-input').classes()).toContain('align-right')
    await trigger.trigger('click')
    await trigger.trigger('click')
    await flushPromises()
    expect(wrapper.find('.select-input').classes()).toContain('align-right')
  })

  // Rects for a list overflowing the viewport bottom, with the combo at the
  // given distance from the viewport top.
  const mockOverflowingBottom = comboTop =>
    vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function () {
        return this.classList.contains('select-input')
          ? { bottom: window.innerHeight + 1, height: 300 }
          : { top: comboTop }
      })

  it('opens the list upward when it overflows the bottom and fits above', async () => {
    mockOverflowingBottom(500)
    await wrapper.find('.flexrow').trigger('click')
    await flushPromises()
    expect(wrapper.find('.combo').classes()).toContain('reversed')
    // Only the position flips, the options keep their order.
    expect(wrapper.findAll('.option-line')[0].attributes('id')).toMatch(
      /option-0$/
    )
  })

  it('keeps the list below when there is no room above the combo', async () => {
    mockOverflowingBottom(200)
    await wrapper.find('.flexrow').trigger('click')
    await flushPromises()
    expect(wrapper.find('.combo').classes()).not.toContain('reversed')
  })

  it('closes the dropdown on Escape', async () => {
    const trigger = wrapper.find('.flexrow')
    await trigger.trigger('click')
    expect(wrapper.find('.select-input').exists()).toBe(true)
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.select-input').exists()).toBe(false)
  })
})
