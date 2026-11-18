import { flushPromises, mount, shallowMount } from '@vue/test-utils'

import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'

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
      },
      global: { stubs: { teleport: false } }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('teleports the list out of its container when asked', async () => {
    const target = document.createElement('div')
    target.id = 'theme-popups'
    document.body.appendChild(target)
    const teleported = shallowMount(ComboboxOptions, {
      props: { options, teleported: true },
      global: { stubs: { teleport: false } }
    })
    await teleported.find('.flexrow').trigger('click')
    await flushPromises()
    const list = target.querySelector('.select-input')
    expect(list).not.toBeNull()
    expect(list.style.top).not.toBe('')
    expect(teleported.find('.select-input').exists()).toBe(false)
    teleported.unmount()
    target.remove()
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

  it('renders an option through the option slot instead of its label', async () => {
    wrapper = shallowMount(ComboboxOptions, {
      props: { title: 'Display options', options, modelValue: {} },
      slots: {
        option: `<template #option="{ option }">
          <b class="custom">{{ option.value }}</b>
        </template>`
      },
      global: { stubs: { teleport: false } }
    })
    await wrapper.find('.flexrow').trigger('click')
    const line = wrapper.find('.option-line')
    expect(line.find('.custom').text()).toBe('showInfos')
    expect(line.text()).not.toContain('Show infos')
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

  it('draws no group title for options without a group', async () => {
    await wrapper.find('.flexrow').trigger('click')
    expect(wrapper.findAll('.option-line')).toHaveLength(3)
    expect(wrapper.find('.option-group-title').exists()).toBe(false)
    expect(wrapper.find('[role="group"]').exists()).toBe(false)
  })

  describe('with grouped options', () => {
    const groupedOptions = [
      { label: 'Modeling', value: 'tt-model', group: 'Assets' },
      { label: 'Rigging', value: 'tt-rig', group: 'Assets' },
      { label: 'Animation', value: 'tt-anim', group: 'Shots' }
    ]

    const mountGrouped = () =>
      mount(ComboboxOptions, {
        props: { options: groupedOptions, modelValue: {} },
        global: { stubs: { teleport: false } }
      })

    it('titles each group of options', async () => {
      const grouped = mountGrouped()
      await grouped.find('.flexrow').trigger('click')

      const groups = grouped.findAll('[role="group"]')
      expect(
        groups.map(group => ({
          title: group.find('.option-group-title').text(),
          options: group.findAll('[role="option"]').map(line => line.text())
        }))
      ).toEqual([
        { title: 'Assets', options: ['Modeling', 'Rigging'] },
        { title: 'Shots', options: ['Animation'] }
      ])
      groups.forEach(group => {
        const titleId = group.find('.option-group-title').attributes('id')
        expect(titleId).toBeTruthy()
        expect(group.attributes('aria-labelledby')).toBe(titleId)
      })
    })

    it('moves the keyboard over the options only, past the group titles', async () => {
      const scrolled = []
      Element.prototype.scrollIntoView = function () {
        scrolled.push(this.textContent.trim())
      }
      try {
        const grouped = mountGrouped()
        const trigger = grouped.find('.flexrow')
        // the first ArrowDown opens the list, the next three reach Animation
        await trigger.trigger('keydown', { key: 'ArrowDown' })
        await trigger.trigger('keydown', { key: 'ArrowDown' })
        await trigger.trigger('keydown', { key: 'ArrowDown' })
        await trigger.trigger('keydown', { key: 'ArrowDown' })
        await flushPromises()
        await trigger.trigger('keydown', { key: 'Enter' })

        expect(grouped.emitted('change')).toEqual([
          [{ key: 'tt-anim', value: true }]
        ])
        expect(scrolled).toEqual(['Modeling', 'Rigging', 'Animation'])
      } finally {
        delete Element.prototype.scrollIntoView
      }
    })
  })
})
