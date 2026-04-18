import { mount } from '@vue/test-utils'
import { defineComponent, ref, nextTick } from 'vue'

import { useModal } from '@/composables/modal'

const createModalWrapper = (active = false) => {
  const TestComponent = defineComponent({
    setup() {
      const activeRef = ref(active)
      const emit = vi.fn()
      useModal(activeRef, emit)
      return { activeRef, emit }
    },
    template: '<div />'
  })
  return mount(TestComponent)
}

describe('composables/modal', () => {
  it('does not add listener when inactive', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    createModalWrapper(false)
    expect(addSpy).not.toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      false
    )
    addSpy.mockRestore()
  })

  it('adds keydown listener when active', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    createModalWrapper(true)
    expect(addSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      false
    )
    addSpy.mockRestore()
  })

  it('emits cancel on Escape key', async () => {
    const wrapper = createModalWrapper(true)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.vm.emit).toHaveBeenCalledWith('cancel')
  })

  it('does not emit cancel on other keys', () => {
    const wrapper = createModalWrapper(true)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(wrapper.vm.emit).not.toHaveBeenCalled()
  })

  it('adds listener when active becomes true', async () => {
    const wrapper = createModalWrapper(false)
    const addSpy = vi.spyOn(window, 'addEventListener')
    wrapper.vm.activeRef = true
    await nextTick()
    expect(addSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      false
    )
    addSpy.mockRestore()
  })

  it('removes listener when active becomes false', async () => {
    const wrapper = createModalWrapper(true)
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    wrapper.vm.activeRef = false
    await nextTick()
    expect(removeSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
    removeSpy.mockRestore()
  })

  it('removes listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = createModalWrapper(true)
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
    removeSpy.mockRestore()
  })
})
