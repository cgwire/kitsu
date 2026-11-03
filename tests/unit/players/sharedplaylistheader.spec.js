import { shallowMount } from '@vue/test-utils'

import SharedPlaylistHeader from '@/components/players/headers/SharedPlaylistHeader.vue'

const mountHeader = props => shallowMount(SharedPlaylistHeader, { props })

describe('players/SharedPlaylistHeader', () => {
  it('offers the zip download when the link allows it', () => {
    const wrapper = mountHeader({ zipUrl: '/api/shared/playlists/t/download/zip' })
    expect(wrapper.find('.zip-download').attributes('href')).toBe(
      '/api/shared/playlists/t/download/zip'
    )
  })

  it('hides the zip download otherwise', () => {
    expect(mountHeader({}).find('.zip-download').exists()).toBe(false)
  })
})
