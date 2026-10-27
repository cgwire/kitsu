import { mount } from '@vue/test-utils'

import PlayerPlaybackBar from '@/components/players/bars/PlayerPlaybackBar.vue'

const mountBar = (props = {}) =>
  mount(PlayerPlaybackBar, {
    props: {
      currentFrameLabel: '005',
      isMovie: true,
      nbFrames: 120,
      ...props
    },
    global: {
      mocks: { $t: key => key },
      stubs: {
        ButtonSimple: true,
        ButtonSound: true,
        ComboboxStyled: true,
        SpeedButton: true
      }
    }
  })

describe('players/PlayerPlaybackBar', () => {
  // The bar sits at the bottom of a full screen: a list opening downward
  // runs off the screen.
  it('opens the list of the 3D animations upward, in their order', () => {
    const animations = [
      { label: 'Walk', value: 'walk' },
      { label: 'Idle', value: 'idle' }
    ]
    const wrapper = mountBar({
      available3DAnimations: animations,
      is3DAnimation: true,
      is3DModel: true,
      isMovie: false
    })
    const combo = wrapper
      .findAllComponents({ name: 'ComboboxStyled' })
      .find(combo => combo.props('options')?.[0]?.value === 'walk')
    expect(combo.props()).toMatchObject({ isReversed: true, keepOrder: true })
  })

  describe('frame indicator', () => {
    it('keeps the 1-based numbering without a frame start', () => {
      const wrapper = mountBar()
      expect(wrapper.text()).toContain('(005 / 120)')
    })

    it('offsets the numbering so the first frame reads as frameStart', () => {
      const wrapper = mountBar({ frameStart: 1001 })
      expect(wrapper.text()).toContain('(1005 / 1120)')
    })

    it('ignores a frame start of zero or less', () => {
      expect(mountBar({ frameStart: 0 }).text()).toContain('(005 / 120)')
      expect(mountBar({ frameStart: -10 }).text()).toContain('(005 / 120)')
    })

    it('offsets the compact light indicator too', () => {
      const wrapper = mountBar({ frameStart: 1001, light: true })
      expect(wrapper.text()).toContain('(1005)')
      expect(wrapper.text()).not.toContain('1120')
    })
  })

  // A sound has a time but no frames, and none of the movie controls.
  describe('sound', () => {
    const mountSound = (props = {}) =>
      mountBar({
        currentTime: '00:00:01:12',
        isMovie: false,
        isSound: true,
        maxDuration: '00:00:03:00',
        ...props
      })

    it('shows the current time of a sound without a frame number', () => {
      const wrapper = mountSound()
      expect(wrapper.get('.current-time').text()).toBe('00:00:01:12')
      expect(wrapper.text()).not.toContain('00:00:03:00')
      expect(wrapper.text()).not.toContain('(005')
    })

    // A review without picture needs no speed, quality or drawing.
    it('gives a sound the repeat and the volume only', () => {
      const wrapper = mountSound({
        isShowAnnotationsWhilePlaying: true,
        isWaveformDisplayed: false
      })
      const icons = wrapper
        .findAllComponents({ name: 'ButtonSimple' })
        .map(button => button.attributes('icon') || button.attributes('text'))
      expect(icons).toEqual(['play', 'repeat'])
      expect(wrapper.findComponent({ name: 'ButtonSound' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'SpeedButton' }).exists()).toBe(false)
    })

    it('hides the repeat of a sound in a light player, like a movie', () => {
      const icons = wrapper =>
        wrapper
          .findAllComponents({ name: 'ButtonSimple' })
          .map(button => button.attributes('icon'))
      expect(icons(mountSound({ light: true }))).not.toContain('repeat')
      expect(icons(mountSound({ fullScreen: true, light: true }))).toContain(
        'repeat'
      )
    })

    it('keeps only play for a sound on a phone', () => {
      const wrapper = mountSound({ phone: true })
      expect(wrapper.findAllComponents({ name: 'ButtonSimple' })).toHaveLength(1)
      expect(wrapper.findComponent({ name: 'ButtonSound' }).exists()).toBe(false)
    })

    it('adds the duration of a sound in full screen', () => {
      const wrapper = mountSound({ fullScreen: true })
      expect(wrapper.text()).toContain('00:00:01:12 / 00:00:03:00')
      expect(wrapper.text()).not.toContain('(005')
    })

    // A narrow preview player hides the time of a movie, which keeps its
    // frame number: a sound would show no position at all.
    it('keeps the time of a sound in a narrow player', () => {
      expect(mountSound().get('.current-time').classes()).not.toContain(
        'narrow-hidden'
      )
      expect(mountBar().get('.current-time').classes()).toContain(
        'narrow-hidden'
      )
    })

    it('shows no time in the compact bar of a full playlist', () => {
      expect(mountSound({ compact: true }).find('.current-time').exists()).toBe(
        false
      )
    })
  })

  describe('phone mode', () => {
    it('keeps only play and the frame number on a phone', () => {
      const wrapper = mountBar({ phone: true })
      const buttons = wrapper.findAllComponents({ name: 'ButtonSimple' })
      expect(buttons).toHaveLength(1)
      expect(buttons[0].attributes('icon')).toBe('play')
      expect(wrapper.findComponent({ name: 'SpeedButton' }).exists()).toBe(false)
      expect(wrapper.findComponent({ name: 'ButtonSound' }).exists()).toBe(false)
      expect(wrapper.find('.current-time').exists()).toBe(false)
      expect(wrapper.text()).toContain('(005 / 120)')
    })

    it('renders every control off a phone', () => {
      const wrapper = mountBar()
      expect(wrapper.findComponent({ name: 'SpeedButton' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ButtonSound' }).exists()).toBe(true)
      expect(
        wrapper
          .findAllComponents({ name: 'ButtonSimple' })
          .some(button => button.attributes('text') === 'LD')
      ).toBe(true)
    })
  })
})
