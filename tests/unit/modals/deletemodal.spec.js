import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DeleteModal from '@/components/modals/DeleteModal.vue'

const mountModal = (props = {}) =>
  mount(DeleteModal, {
    props: { active: true, text: 'Are you sure?', ...props }
  })

describe('DeleteModal', () => {
  // The server explanation is technical and stays in English, so it is
  // shown apart from the translated error instead of blended into it.
  it('shows the technical details apart from the error text', () => {
    const wrapper = mountModal({
      isError: true,
      errorText: 'Still linked',
      errorDetails: 'Task type is attached to schedule items.'
    })

    expect(wrapper.get('.is-danger').text()).toEqual('Still linked')
    expect(wrapper.get('.error-details').text()).toEqual(
      '(main.technical_details Task type is attached to schedule items.)'
    )
  })

  it('hides the details without an error', () => {
    const wrapper = mountModal({
      errorText: 'Still linked',
      errorDetails: 'Task type is attached to schedule items.'
    })

    expect(wrapper.find('.error-details').exists()).toBe(false)
  })

  it('hides the details when the server gave none', () => {
    const wrapper = mountModal({ isError: true, errorText: 'Still linked' })

    expect(wrapper.find('.error-details').exists()).toBe(false)
  })

  it('announces an error with its details', async () => {
    const wrapper = mountModal({
      errorText: 'Still linked',
      errorDetails: 'Used by 2 status automations.'
    })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)

    await wrapper.setProps({ isError: true })
    expect(wrapper.find('[role="alert"]').text().replace(/\s+/g, ' ')).toBe(
      'Still linked (main.technical_details Used by 2 status automations.)'
    )
  })

  // A row button hides itself once the modal covers the row, which used to
  // drop the focus on <body>: Shift+Tab then reached the page behind.
  it('keeps Shift+Tab inside the modal it opened', async () => {
    const wrapper = mount(DeleteModal, {
      props: { active: false, text: 'Are you sure?' },
      attachTo: document.body
    })

    await wrapper.setProps({ active: true })
    await flushPromises()
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      cancelable: true
    })
    window.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('button.is-link').element)
    wrapper.unmount()
  })
})
