import { mount } from '@vue/test-utils'

import ModalFooter from '@/components/modals/ModalFooter.vue'

import { mountWithI18n } from '../fixtures/i18n'

const confirmButton = wrapper => wrapper.find('a.button.is-primary')

const activate = async wrapper => {
  const button = confirmButton(wrapper)
  await button.trigger('click')
  await button.trigger('keydown', { key: 'Enter' })
  await button.trigger('keydown', { key: ' ' })
}

describe('modals/ModalFooter', () => {
  it('names the action on its button', () => {
    const wrapper = mount(ModalFooter, { props: { confirmLabel: 'Create a shot' } })

    expect(confirmButton(wrapper).text()).toEqual('Create a shot')
  })

  it('confirms on a click, Enter, or Space', async () => {
    const wrapper = mount(ModalFooter, { props: { confirmLabel: 'Create a shot' } })

    await activate(wrapper)

    expect(wrapper.emitted('confirm')).toHaveLength(3)
    expect(confirmButton(wrapper).attributes('tabindex')).toBe('0')
  })

  // The disabled look only blocks the mouse (pointer-events: none): the
  // keyboard still reaches the button.
  it('does not confirm while disabled', async () => {
    const wrapper = mount(ModalFooter, {
      props: { confirmLabel: 'Create a shot', isDisabled: true } })

    await activate(wrapper)

    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(confirmButton(wrapper).attributes('aria-disabled')).toBe('true')
    expect(confirmButton(wrapper).attributes('tabindex')).toBe('-1')
  })

  it('does not confirm again while loading', async () => {
    const wrapper = mount(ModalFooter, {
      props: { confirmLabel: 'Create a shot', isLoading: true } })

    await activate(wrapper)

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('shows the details of an error under its text', async () => {
    const wrapper = mountWithI18n(ModalFooter, {
      props: {
        confirmLabel: 'Create a shot',
        errorText: 'Could not save.',
        errorDetails: 'Bad value.'
      }
    })
    expect(wrapper.find('.error-details').exists()).toBe(false)

    await wrapper.setProps({ isError: true })
    expect(wrapper.find('.error').text()).toBe('Could not save.')
    expect(wrapper.find('.error-details').text()).toBe(
      '(Technical details: Bad value.)'
    )

    await wrapper.setProps({ errorDetails: '' })
    expect(wrapper.find('.error-details').exists()).toBe(false)
  })

  // A screen reader reads an alert as it shows up.
  it('announces an error with its details', async () => {
    const wrapper = mountWithI18n(ModalFooter, {
      props: {
        confirmLabel: 'Create a shot',
        errorText: 'Could not save.',
        errorDetails: 'Bad value.'
      }
    })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)

    await wrapper.setProps({ isError: true })
    expect(
      wrapper.find('[role="alert"]').text().replace(/\s+/g, ' ')
    ).toBe('Could not save. (Technical details: Bad value.)')
  })
})
