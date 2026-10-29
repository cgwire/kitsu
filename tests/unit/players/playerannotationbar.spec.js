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

  // Annotating and commenting are two rights: an assigned artist comments
  // a movie it cannot draw on.
  it('offers the comments toggle alone on a read-only movie', () => {
    const wrapper = mountBar({
      canComment: true,
      fullScreen: true,
      readOnly: true
    })
    const icons = wrapper
      .findAll('button-simple-stub')
      .map(button => button.attributes('icon'))
    expect(icons).toContain('comment')
    expect(icons).not.toContain('pencil')
  })

  // No annotation outside a movie or a picture: the comments toggle only.
  describe('other files', () => {
    const icons = wrapper =>
      wrapper
        .findAll('button-simple-stub')
        .map(button => button.attributes('icon'))
    const mountFile = props =>
      mountBar({
        isMovie: false,
        isAnnotationsDisplayed: true,
        isEraserModeOn: false,
        isLaserModeOn: false,
        isOnionSkinOn: false,
        isShapeMode: false,
        ...props
      })

    it('offers the comments toggle alone in full screen', () => {
      const wrapper = mountFile({ fullScreen: true })
      expect(icons(wrapper)).toEqual(['comment'])
      expect(wrapper.find('.annotation-tools').exists()).toBe(false)
    })

    it('offers the comments toggle to a consumer asking it', () => {
      expect(icons(mountFile({ showCommentsButton: true }))).toEqual([
        'comment'
      ])
    })

    it('keeps the comments toggle from a read-only file', () => {
      expect(icons(mountFile({ fullScreen: true, readOnly: true }))).toEqual(
        []
      )
    })

    // Annotating and commenting are two rights.
    it('offers the comments toggle of a read-only file to who can comment', () => {
      expect(
        icons(mountFile({ canComment: true, fullScreen: true, readOnly: true }))
      ).toEqual(['comment'])
    })

    it('keeps the comments toggle off a phone', () => {
      expect(
        icons(mountFile({ phone: true, showCommentsButton: true }))
      ).toEqual([])
    })

    it('offers the comments toggle after the 3D controls', () => {
      expect(icons(mountFile({ fullScreen: true, is3DModel: true }))).toEqual([
        'image',
        'box',
        'comment'
      ])
    })

    it('keeps the 3D controls alone on a phone', () => {
      expect(
        icons(
          mountFile({ is3DModel: true, phone: true, showCommentsButton: true })
        )
      ).toEqual(['image', 'box'])
    })
  })

  // Opt-in control: a consumer that does not bind it gets no picker.
  it('shows the onion skin picker to the consumer binding it', () => {
    expect(
      mountBar({ isOnionSkinOn: false }).find('onion-skin-picker-stub').exists()
    ).toBe(true)
  })

  it('keeps the onion skin picker from a consumer not binding it', () => {
    expect(mountBar().find('onion-skin-picker-stub').exists()).toBe(false)
  })

  it('shows the annotation toggle to the consumer binding it', () => {
    expect(
      mountBar({ isAnnotationsDisplayed: true }).find('[icon="pen"]').exists()
    ).toBe(true)
  })

  it('keeps the annotation toggle from a consumer not binding it', () => {
    expect(mountBar().find('[icon="pen"]').exists()).toBe(false)
  })
})
