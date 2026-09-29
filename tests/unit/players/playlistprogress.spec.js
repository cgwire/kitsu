import { flushPromises, mount } from '@vue/test-utils'

import PlaylistProgress from '@/components/players/progress/PlaylistProgress.vue'

vi.mock('@/lib/players/tiles', async importOriginal => ({
  ...(await importOriginal()),
  getTileGeometry: () =>
    Promise.resolve({ cellWidth: 178, rows: 480, cellCount: 3840 })
}))

const FPS = 25
const FRAME_DURATION = 0.04

// A long edit (8000 frames, subsampled sprite) followed by a short shot.
const entities = [
  {
    id: 'edit',
    name: 'E01',
    parent_name: 'EP01',
    preview_file_id: 'p-edit',
    preview_file_extension: 'mp4',
    start_duration: 1 / FPS,
    playlist_start_frame: 0,
    playlist_nb_frames: 8000
  },
  {
    id: 'shot',
    name: 'SH01',
    parent_name: 'SQ01',
    preview_file_id: 'p-shot',
    preview_file_extension: 'mp4',
    start_duration: 8001 / FPS,
    playlist_start_frame: 8000,
    playlist_nb_frames: 100
  }
]

const positions = {}
entities.forEach((entity, index) => {
  for (let i = 0; i < entity.playlist_nb_frames; i++) {
    positions[entity.playlist_start_frame + i] = {
      index,
      id: entity.preview_file_id,
      extension: 'mp4',
      start: entity.start_duration,
      width: 1920,
      height: 1080
    }
  }
})

const mountProgress = () =>
  mount(PlaylistProgress, {
    props: {
      entityList: entities,
      fps: FPS,
      frameDuration: FRAME_DURATION,
      nbFrames: 8000,
      playlistDuration: 8100 / FPS,
      playlistProgress: 0,
      playlistShotPosition: positions
    },
    global: { mocks: { $t: key => key } }
  })

describe('players/PlaylistProgress', () => {
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

  it('picks the hovered thumbnail from the hovered entity frame count', async () => {
    // The current entity's nbFrames drove the sprite subsampling: hovering
    // a short shot while a long edit plays showed the shot's first frames.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      { left: 0, top: 0, width: 8100, height: 18 }
    )
    const wrapper = mountProgress()
    const bar = wrapper.find('.playlist-progress')
    await bar.trigger('mouseenter')
    // Pixel 8050.5 of 8100: global frame 8050, local frame 50 of the shot.
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 8050.5 }))
    await flushPromises()
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 8050.5 }))
    await flushPromises()
    const tile = wrapper.find('.frame-tile')
    expect(tile.exists()).toBe(true)
    // Cell 50 of an 8-column sprite: column 2, row 6.
    expect(tile.element.style.backgroundPosition).toBe('-356px -600px')
  })
})
