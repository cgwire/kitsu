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
