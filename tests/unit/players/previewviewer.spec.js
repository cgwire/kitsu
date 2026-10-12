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
})
