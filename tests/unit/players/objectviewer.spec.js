import { mount } from '@vue/test-utils'

import ObjectViewer from '@/components/players/viewers/ObjectViewer.vue'

// jsdom has no WebGL2, which is exactly the Safari 14 situation: the
// viewer must show its fallback message instead of a dead canvas.
describe('players/ObjectViewer without WebGL2', () => {
  test('renders the not-supported message instead of the viewer', () => {
    const wrapper = mount(ObjectViewer)
    expect(wrapper.find('.viewer-unavailable').text()).toBe(
      'main.preview_3d_not_supported'
    )
    expect(wrapper.find('model-viewer').exists()).toBe(false)
  })

  test('exposed playback methods are null-safe without a viewer', () => {
    const wrapper = mount(ObjectViewer)
    expect(wrapper.vm.getAnimations()).toEqual([])
    expect(() => {
      wrapper.vm.play('walk')
      wrapper.vm.pause()
    }).not.toThrow()
  })
})
