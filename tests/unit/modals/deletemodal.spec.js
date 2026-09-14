import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DeleteModal from '@/components/modals/DeleteModal.vue'

const mountModal = (props = {}) =>
  mount(DeleteModal, {
    props: { active: true, text: 'Are you sure?', ...props },
    global: { mocks: { $t: key => key } }
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
})
