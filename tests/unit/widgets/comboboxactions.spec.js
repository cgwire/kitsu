import { shallowMount } from '@vue/test-utils'

import ComboboxActions from '@/components/widgets/ComboboxActions.vue'

import './setup'

describe('ComboboxActions', () => {
  let handler, wrapper

  beforeEach(() => {
    handler = vi.fn()
    const actions = [
      { label: 'Duplicate', handler },
      { label: 'Open docs', href: 'https://example.com/docs' }
    ]

    wrapper = shallowMount(ComboboxActions, {
      props: { title: 'Actions', actions }
    })
  })

  it('exposes combobox/listbox ARIA roles', async () => {
    const trigger = wrapper.find('.flexrow')
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('tabindex')).toBe('0')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.select-input').attributes('role')).toBe('listbox')
    expect(wrapper.findAll('.option-line')[0].attributes('role')).toBe(
      'option'
    )
  })

  it('runs the handler and closes when selecting via keyboard', async () => {
    const trigger = wrapper.find('.flexrow')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(handler).toHaveBeenCalled()
    expect(wrapper.find('.select-input').exists()).toBe(false)
  })

  it('opens the href action in a new tab when selecting via keyboard', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {})
    const trigger = wrapper.find('.flexrow')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com/docs',
      '_blank',
      'noopener,noreferrer'
    )
    openSpy.mockRestore()
  })

  it('closes on Escape', async () => {
    const trigger = wrapper.find('.flexrow')
    await trigger.trigger('click')
    expect(wrapper.find('.select-input').exists()).toBe(true)
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.select-input').exists()).toBe(false)
  })
})
