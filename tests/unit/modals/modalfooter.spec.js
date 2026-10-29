import { mount } from '@vue/test-utils'

import ModalFooter from '@/components/modals/ModalFooter.vue'

const confirmButton = wrapper => wrapper.find('a.button.is-primary')

const activate = async wrapper => {
  const button = confirmButton(wrapper)
  await button.trigger('click')
  await button.trigger('keydown', { key: 'Enter' })
  await button.trigger('keydown', { key: ' ' })
}

describe('modals/ModalFooter', () => {
  it('confirms on a click, Enter, or Space', async () => {
    const wrapper = mount(ModalFooter)

    await activate(wrapper)

    expect(wrapper.emitted('confirm')).toHaveLength(3)
    expect(confirmButton(wrapper).attributes('tabindex')).toBe('0')
  })

  // The disabled look only blocks the mouse (pointer-events: none): the
  // keyboard still reaches the button.
  it('does not confirm while disabled', async () => {
    const wrapper = mount(ModalFooter, { props: { isDisabled: true } })

    await activate(wrapper)

    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(confirmButton(wrapper).attributes('aria-disabled')).toBe('true')
    expect(confirmButton(wrapper).attributes('tabindex')).toBe('-1')
  })

  it('does not confirm again while loading', async () => {
    const wrapper = mount(ModalFooter, { props: { isLoading: true } })

    await activate(wrapper)

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })
})
