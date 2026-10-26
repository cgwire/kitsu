import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PreviewViewer from '@/components/players/viewers/PreviewViewer.vue'

describe('PreviewViewer', () => {
  // No viewer handles this extension: the panel offers the file instead.
  it('downloads a file it cannot show without leaving the page', () => {
    const wrapper = shallowMount(PreviewViewer, {
      props: {
        preview: {
          id: 'preview-1',
          extension: 'zip',
          original_name: 'scene',
          status: 'ready'
        }
      }
    })
    const link = wrapper.get('a.button')
    expect(link.attributes('href')).toBe(
      '/api/pictures/originals/preview-files/preview-1/download'
    )
    expect(link.attributes('download')).toBe('')
  })

  // Both viewers stay mounted: the finger gestures go to the one on screen.
  it.each([
    ['mp4', 'VideoViewer'],
    ['png', 'PictureViewer']
  ])('sends the finger gestures on a %s to the %s', (extension, name) => {
    const calls = []
    const viewerStub = viewerName => ({
      name: viewerName,
      template: '<div />',
      methods: {
        panBy: (...args) => calls.push([viewerName, 'panBy', ...args]),
        zoomAt: (...args) => calls.push([viewerName, 'zoomAt', ...args])
      }
    })
    const wrapper = shallowMount(PreviewViewer, {
      props: { preview: { id: 'preview-1', extension, status: 'ready' } },
      global: {
        stubs: {
          PictureViewer: viewerStub('PictureViewer'),
          VideoViewer: viewerStub('VideoViewer')
        }
      }
    })

    wrapper.vm.panBy(3, 4)
    wrapper.vm.zoomAt(100, 50, 2)

    expect(calls).toEqual([
      [name, 'panBy', 3, 4],
      [name, 'zoomAt', 100, 50, 2]
    ])
  })

  // The player shows the time of a sound under their own names: the movie
  // events size the frames and the progress bar of a movie.
  it('forwards the time and the duration of a sound apart', () => {
    const wrapper = shallowMount(PreviewViewer, {
      props: { preview: { id: 'preview-1', extension: 'mp3', status: 'ready' } }
    })
    const sound = wrapper.findComponent({ name: 'SoundViewer' })
    sound.vm.$emit('duration-changed', 0)
    sound.vm.$emit('duration-changed', 3.2)
    sound.vm.$emit('time-update', 1.5)

    expect(wrapper.emitted('sound-duration-changed')).toEqual([[0], [3.2]])
    expect(wrapper.emitted('sound-time-update')).toEqual([[1.5]])
    expect(wrapper.emitted('duration-changed')).toBeUndefined()
    expect(wrapper.emitted('time-update')).toBeUndefined()
  })

  // A sound has no height of its own: in full screen the viewer takes the
  // screen height, so the waveform can sit in its middle as in a playlist.
  it.each([
    ['mp3', true, 'calc(100vh - 32px)'],
    ['wav', true, 'calc(100vh - 32px)'],
    ['mp3', false, ''],
    ['png', true, ''],
    ['mp4', true, '']
  ])(
    'gives a %s viewer the screen height in full screen: %s',
    (extension, isFullScreen, height) => {
      const wrapper = shallowMount(PreviewViewer, {
        props: {
          isFullScreen,
          marginBottom: 32,
          preview: { id: 'preview-1', extension, status: 'ready' }
        }
      })
      expect(wrapper.element.style.height).toBe(height)
    }
  )
})
