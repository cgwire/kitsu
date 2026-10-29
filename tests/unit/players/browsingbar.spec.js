import { mount } from '@vue/test-utils'

import BrowsingBar from '@/components/players/bars/BrowsingBar.vue'

const mountBar = (extension, props = {}) =>
  mount(BrowsingBar, {
    props: {
      currentIndex: 1,
      light: true,
      previews: [{ extension }],
      ...props
    },
    global: {
      mocks: { $t: key => key },
      stubs: { ButtonSimple: true }
    }
  })

const icons = wrapper =>
  wrapper
    .findAllComponents({ name: 'ButtonSimple' })
    .map(button => button.attributes('icon'))

describe('players/BrowsingBar', () => {
  // A light bar leaves its room to the playback controls of a movie or a
  // sound: they would push the full screen button out of it.
  it.each([
    ['mp4', false],
    ['mp3', false],
    ['wav', false],
    ['png', true],
    ['pdf', true]
  ])('browses the files of a light bar on a %s: %s', (extension, isShown) => {
    const wrapper = mountBar(extension)
    expect(icons(wrapper).includes('left')).toBe(isShown)
    expect(icons(wrapper).includes('right')).toBe(isShown)
    expect(wrapper.find('.current-index').exists()).toBe(isShown)
  })

  // The host opens their modals in the player while it is in full screen.
  it.each([
    [false, false, ['plus', 'trash']],
    [true, false, ['plus']],
    [false, true, ['plus', 'trash']],
    [true, true, ['plus', 'trash']]
  ])(
    'offers to add and delete a file, light %s, full screen %s',
    (light, fullScreen, offered) => {
      const wrapper = mountBar('png', { fullScreen, light })
      const actions = icons(wrapper).filter(icon =>
        ['plus', 'trash'].includes(icon)
      )
      expect(actions).toEqual(offered)
    }
  )

  it('browses the files of a sound out of a light bar', () => {
    const previews = [{ extension: 'mp3' }, { extension: 'wav' }]
    const wrapper = mountBar('mp3', { light: false, previews })
    expect(icons(wrapper)).toEqual(expect.arrayContaining(['left', 'right']))
    expect(wrapper.find('.current-index').text()).toBe('1')
  })
})
