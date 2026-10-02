import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import SharedPlaylistButtonBar from '@/components/players/bars/SharedPlaylistButtonBar.vue'
import SharedPlaylistPlayer from '@/components/players/players/SharedPlaylistPlayer.vue'
import SharedCommentsPanel from '@/components/players/sides/SharedCommentsPanel.vue'

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

const shot = {
  id: 'shot-1',
  name: 'SH010',
  preview_file_id: 'preview-v2',
  preview_file_extension: 'mp4',
  preview_file_duration: 30,
  preview_file_revision: 2,
  preview_file_task_id: 'task-1'
}

const mountPlayer = ({
  entities = [entity],
  setCurrentFrame = () => {}
} = {}) => {
  const store = createStore({
    getters: { user: () => ({ id: 'guest-1', is_guest: true }) }
  })
  return shallowMount(SharedPlaylistPlayer, {
    props: {
      entities,
      playlist: { name: 'Dailies', project_fps: 25 },
      token: 'token'
    },
    global: {
      mocks: { $t: key => key },
      plugins: [store],
      stubs: {
        // The player drives these through refs; the default stubs have none
        // of their methods.
        MultiVideoViewer: {
          name: 'MultiVideoViewer',
          template: '<div />',
          methods: {
            getNaturalDimensions: () => ({ width: 1920, height: 1080 }),
            loadEntity: () => {},
            pause: () => {},
            resetHeight: () => {},
            resetPanZoom: () => {},
            resumePanZoom: () => {},
            setCurrentFrame,
            setVolume: () => {}
          }
        },
        VideoProgress: {
          template: '<div />',
          methods: { updateProgressBar: () => {} }
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

  describe('timecode navigation', () => {
    const clickTimeCode = async (wrapper, versionRevision) => {
      wrapper
        .findComponent(SharedCommentsPanel)
        .vm.$emit('time-code-clicked', { versionRevision, frame: 420 })
      await nextTick()
    }
    const frameDisplay = wrapper =>
      wrapper.findComponent(SharedPlaylistButtonBar).props('currentFrameDisplay')

    it('seeks to a timecode of the shared version', async () => {
      const setCurrentFrame = vi.fn()
      const wrapper = mountPlayer({ entities: [shot], setCurrentFrame })
      await clickTimeCode(wrapper, '2')
      expect(setCurrentFrame).toHaveBeenCalledWith(420)
      expect(frameDisplay(wrapper)).toBe('421')
      wrapper.unmount()
    })

    it('ignores a timecode of a version the link does not share', async () => {
      const setCurrentFrame = vi.fn()
      const wrapper = mountPlayer({ entities: [shot], setCurrentFrame })
      await clickTimeCode(wrapper, '1')
      expect(setCurrentFrame).not.toHaveBeenCalledWith(420)
      expect(frameDisplay(wrapper)).toBe('001')
      wrapper.unmount()
    })
  })
})
