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

  it('shows no progress bar by default', () => {
    expect(mountModal().find('.progress').exists()).toBe(false)
  })

  it('shows the progress of a long confirmation', () => {
    const wrapper = mountModal({ progress: 40 })
    expect(wrapper.find('.progress').element.style.width).toBe('40%')
  })

  // the loading look only stops the mouse: Enter and Space still reach
  // the button
  it('ignores a keyboard confirm while loading', async () => {
    const wrapper = mountModal({ isLoading: true })
    await confirmButton(wrapper).trigger('keydown.enter')
    await confirmButton(wrapper).trigger('keydown.space')
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })
})
