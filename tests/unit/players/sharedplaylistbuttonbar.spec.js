import { mount } from '@vue/test-utils'

import SharedPlaylistButtonBar from '@/components/players/bars/SharedPlaylistButtonBar.vue'

const mountBar = (props = { isMovie: true }) =>
  mount(SharedPlaylistButtonBar, {
    props: { ...props, token: 'token' },
    global: { mocks: { $t: key => key } }
  })

const timeProps = {
  currentFrameDisplay: '031',
  currentTimeFormatted: '00:00:01:05',
  maxDurationFormatted: '00:00:03:00',
  nbFramesDisplay: '075'
}

describe('players/SharedPlaylistButtonBar', () => {
  it('offers no LD/HD switch: shared links only serve the originals', () => {
    const wrapper = mountBar()
    const buttons = wrapper.findAll('button').map(button => button.text())
    expect(buttons).not.toContain('HD')
    expect(buttons).not.toContain('LD')
  })

  it('shows the time and the frame of a movie', () => {
    const wrapper = mountBar({ ...timeProps, isMovie: true })
    expect(wrapper.find('.time-info').text()).toMatch(
      /00:00:01:05\s*\/\s*00:00:03:00/
    )
    expect(wrapper.find('.frame-counter').text()).toBe('(031 / 075)')
  })

  it('shows the time of a sound, without a frame counter', () => {
    const wrapper = mountBar({ ...timeProps, isSound: true })
    expect(wrapper.find('.time-info').text()).toMatch(
      /00:00:01:05\s*\/\s*00:00:03:00/
    )
    expect(wrapper.find('.frame-counter').exists()).toBe(false)
  })
})
