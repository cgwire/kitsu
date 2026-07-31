import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ConfirmModal from '@/components/modals/ConfirmModal.vue'

const mountModal = (props = {}) =>
  mount(ConfirmModal, {
    props: { active: true, text: 'Are you sure?', ...props }
  })

const confirmButton = wrapper => wrapper.get('.box a.button')

describe('ConfirmModal', () => {
  it('paints the confirm button green by default', () => {
    const button = confirmButton(mountModal())
    expect(button.classes()).toContain('is-primary')
    expect(button.classes()).not.toContain('is-danger')
  })

  it('paints the confirm button red for a destructive action', () => {
    const button = confirmButton(mountModal({ isDanger: true }))
    expect(button.classes()).toContain('is-danger')
    expect(button.classes()).not.toContain('is-primary')
  })

  it('keeps the loading state independent from the colour', () => {
    const button = confirmButton(mountModal({ isDanger: true, isLoading: true }))
    expect(button.classes()).toContain('is-danger')
    expect(button.classes()).toContain('is-loading')
  })
})
