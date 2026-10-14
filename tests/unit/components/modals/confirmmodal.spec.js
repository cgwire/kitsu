import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ConfirmModal from '@/components/modals/ConfirmModal.vue'

const mountModal = props =>
  mount(ConfirmModal, {
    props: { active: true, text: 'Sure?', ...props },
    global: { mocks: { $t: key => key } }
  })

describe('ConfirmModal', () => {
  it('shows no progress bar by default', () => {
    const wrapper = mountModal()
    expect(wrapper.find('.progress').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows the progress of a long confirmation', () => {
    const wrapper = mountModal({ progress: 40 })
    expect(wrapper.find('.progress').element.style.width).toBe('40%')
    wrapper.unmount()
  })
})
