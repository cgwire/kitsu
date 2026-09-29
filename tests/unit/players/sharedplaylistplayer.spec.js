import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import SharedPlaylistPlayer from '@/components/players/players/SharedPlaylistPlayer.vue'

const entity = {
  id: 'entity-1',
  name: 'SH01',
  parent_name: 'SQ01',
  preview_file_id: 'preview-1',
  preview_file_extension: 'mp4',
  preview_file_duration: 4,
  preview_file_width: 1920,
  preview_file_height: 1080
}

const mountPlayer = () => {
  const store = createStore({
    getters: { user: () => ({ id: 'guest-1', is_guest: true }) }
  })
  return shallowMount(SharedPlaylistPlayer, {
    props: {
      entities: [entity],
      playlist: { name: 'Dailies', project_fps: 25 },
      token: 'token'
    },
    global: {
      mocks: { $t: key => key },
      plugins: [store],
      stubs: {
        MultiVideoViewer: {
          name: 'MultiVideoViewer',
          template: '<div />',
          methods: {
            getNaturalDimensions: () => ({ width: 1920, height: 1080 }),
            loadEntity: () => {},
            pause: () => {},
            resetPanZoom: () => {},
            resumePanZoom: () => {},
            setVolume: () => {}
          }
        }
      }
    }
  })
}

describe('players/SharedPlaylistPlayer', () => {
  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    )
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('counts the frames from the preview duration, like the studio player', async () => {
    // The decoder duration floored to the frame plus the Chromium offset
    // read one frame more than the studio player on the same clip.
    vi.stubGlobal('chrome', {})
    const wrapper = mountPlayer()
    await nextTick()
    wrapper.findComponent({ name: 'MultiVideoViewer' }).vm.$emit(
      'max-duration-update',
      4.02
    )
    await nextTick()
    const bar = wrapper.findComponent({ name: 'SharedPlaylistButtonBar' })
    expect(bar.props('nbFramesDisplay')).toBe('100')
    wrapper.unmount()
  })
})
