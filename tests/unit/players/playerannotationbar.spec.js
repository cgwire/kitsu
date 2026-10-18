import { mount } from '@vue/test-utils'

import PlayerAnnotationBar from '@/components/players/bars/PlayerAnnotationBar.vue'

const mountBar = (props = {}) =>
  mount(PlayerAnnotationBar, {
    props: { isMovie: true, ...props },
    global: {
      mocks: { $t: key => key },
      stubs: {
        ButtonSimple: true,
        ColorPicker: true,
        OnionSkinPicker: true,
        PencilPicker: true,
        ShapePicker: true
      }
    }
  })

describe('players/PlayerAnnotationBar', () => {
  describe('phone mode', () => {
    const icons = wrapper =>
      wrapper
        .findAll('button-simple-stub')
        .map(button => button.attributes('icon'))

    it('keeps undo and the pencil on a phone', () => {
      const wrapper = mountBar({ phone: true, fullScreen: false })
      expect(icons(wrapper)).toEqual(['undo', 'pencil'])
      expect(wrapper.find('pencil-picker-stub').exists()).toBe(false)
      expect(wrapper.find('color-picker-stub').exists()).toBe(false)
    })

    it('draws with the default pencil on a phone', () => {
      const wrapper = mountBar({ phone: true, isDrawing: true })
      expect(wrapper.find('.annotation-tools').exists()).toBe(false)
    })

    it('keeps the desktop tools off a phone', () => {
      const wrapper = mountBar({
        fullScreen: false,
        isEraserModeOn: false,
        showCommentsButton: true
      })
      expect(icons(wrapper)).toEqual(
        expect.arrayContaining(['pencil', 'eraser', 'comment'])
      )
      expect(icons(wrapper)).not.toContain('undo')
    })
  })
})
