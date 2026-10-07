import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import PreviewModal from '@/components/modals/PreviewModal.vue'

describe('PreviewModal', () => {
  it('downloads the preview without leaving the page', () => {
    const wrapper = mount(PreviewModal, {
      props: { active: true, previewFileId: 'preview-1' }
    })
    const link = wrapper.get(
      'a[href="/api/pictures/originals/preview-files/preview-1/download"]'
    )
    expect(link.attributes('download')).toBe('')
    wrapper.unmount()
  })

  // Its buttons sit out of .modal-content: the trap must hold the whole root.
  it('keeps Tab on its buttons', async () => {
    const wrapper = mount(PreviewModal, {
      props: { active: true, previewFileId: 'preview-1' },
      attachTo: document.body
    })
    await flushPromises()
    const pressTab = shiftKey => {
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey,
        cancelable: true
      })
      window.dispatchEvent(event)
    }

    pressTab(true)
    expect(document.activeElement).toBe(wrapper.get('[role="button"]').element)
    pressTab(false)
    expect(document.activeElement).toBe(wrapper.get('a[download]').element)
    wrapper.unmount()
  })

  describe('browsing', () => {
    const mountModal = previewFileId =>
      mount(PreviewModal, {
        props: {
          active: true,
          previewFileId,
          previewFileIds: ['preview-1', 'preview-2', 'preview-3']
        }
      })

    const press = key => window.dispatchEvent(new KeyboardEvent('keydown', { key }))

    it('moves to the sibling previews with the arrow keys', () => {
      const wrapper = mountModal('preview-2')

      press('ArrowRight')
      press('ArrowLeft')

      expect(wrapper.emitted('change')).toEqual([['preview-3'], ['preview-1']])
      wrapper.unmount()
    })

    it('stops at both ends of the list', () => {
      const first = mountModal('preview-1')
      press('ArrowLeft')
      expect(first.emitted('change')).toBeUndefined()
      expect(first.find('.previous').exists()).toBe(false)
      expect(first.find('.next').exists()).toBe(true)
      first.unmount()

      const last = mountModal('preview-3')
      press('ArrowRight')
      expect(last.emitted('change')).toBeUndefined()
      expect(last.find('.next').exists()).toBe(false)
      last.unmount()
    })

    it('moves with the side buttons without closing', async () => {
      const wrapper = mountModal('preview-2')

      await wrapper.find('.next').trigger('click')

      expect(wrapper.emitted('change')).toEqual([['preview-3']])
      expect(wrapper.emitted('cancel')).toBeUndefined()
      wrapper.unmount()
    })

    it('offers nothing to browse for a lone preview', () => {
      const wrapper = mount(PreviewModal, {
        props: { active: true, previewFileId: 'preview-1' }
      })

      press('ArrowRight')

      expect(wrapper.emitted('change')).toBeUndefined()
      expect(wrapper.find('.next').exists()).toBe(false)
      wrapper.unmount()
    })

    // Alt and Cmd arrows go back and forth in the browser history.
    it('leaves the modified arrows alone', () => {
      const wrapper = mountModal('preview-2')
      const modifiers = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']

      modifiers.forEach(modifier => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowRight', [modifier]: true })
        )
      })

      expect(wrapper.emitted('change')).toBeUndefined()
      wrapper.unmount()
    })

    // A key event goes from the focused element up to the window, where the
    // players of the page behind listen to the arrows.
    it('keeps its arrows from the page behind', () => {
      const pageListener = vi.fn()
      window.addEventListener('keydown', pageListener)
      const wrapper = mountModal('preview-3')
      const pressOnPage = options =>
        document.body.dispatchEvent(
          new KeyboardEvent('keydown', { bubbles: true, ...options })
        )

      pressOnPage({ key: 'ArrowLeft' })
      pressOnPage({ key: 'ArrowRight' })
      expect(wrapper.emitted('change')).toEqual([['preview-2']])
      expect(pageListener).not.toHaveBeenCalled()

      pressOnPage({ key: 'ArrowLeft', altKey: true })
      expect(pageListener).toHaveBeenCalledTimes(1)

      wrapper.unmount()
      window.removeEventListener('keydown', pageListener)
    })
  })
})
