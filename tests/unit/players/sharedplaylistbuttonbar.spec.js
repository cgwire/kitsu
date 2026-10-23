import { mount } from '@vue/test-utils'

import SharedPlaylistButtonBar from '@/components/players/bars/SharedPlaylistButtonBar.vue'

const mountBar = () =>
  mount(SharedPlaylistButtonBar, {
    props: { isMovie: true, token: 'token' },
    global: { mocks: { $t: key => key } }
  })

describe('players/SharedPlaylistButtonBar', () => {
  it('offers no LD/HD switch: shared links only serve the originals', () => {
    const wrapper = mountBar()
    const buttons = wrapper.findAll('button').map(button => button.text())
    expect(buttons).not.toContain('HD')
    expect(buttons).not.toContain('LD')
  })
})
