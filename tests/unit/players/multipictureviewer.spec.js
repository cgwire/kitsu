import { mount } from '@vue/test-utils'
import process from 'node:process'

import MultiPictureViewer from '@/components/players/viewers/MultiPictureViewer.vue'

const preview = entry => ({ id: `preview-${entry}`, entry, position: 1 })

describe('players/MultiPictureViewer', () => {
  test('survives a teardown between a preview change and its deferred reset', async () => {
    const rejections = []
    const onRejection = reason => rejections.push(reason)
    process.on('unhandledRejection', onRejection)

    const wrapper = mount(MultiPictureViewer, {
      props: { currentPreview: preview(0), previews: [] }
    })
    // The currentPreview watcher defers resetPicture with nextTick. The
    // player can be torn down before that callback runs (playlist list
    // reload, page leave), which the unmount right after the flush mimics.
    await wrapper.setProps({ currentPreview: preview(1) })
    wrapper.unmount()
    // Node reports a rejected promise once the microtask queue has drained.
    await new Promise(resolve => setTimeout(resolve))
    process.off('unhandledRejection', onRejection)

    expect(rejections).toEqual([])
  })

  // The neighbours of the displayed picture stay mounted to preload.
  test('sends the finger gestures to the picture on screen', () => {
    const calls = []
    const wrapper = mount(MultiPictureViewer, {
      props: {
        currentPreview: preview(1),
        previews: [preview(0), preview(1), preview(2)]
      },
      global: {
        stubs: {
          PictureViewer: {
            props: ['preview'],
            template: '<div />',
            methods: {
              panBy(...args) {
                calls.push([this.preview.id, 'panBy', ...args])
              },
              zoomAt(...args) {
                calls.push([this.preview.id, 'zoomAt', ...args])
              }
            }
          }
        }
      }
    })

    wrapper.vm.panBy(3, 4)
    wrapper.vm.zoomAt(100, 50, 2)

    expect(calls).toEqual([
      ['preview-1', 'panBy', 3, 4],
      ['preview-1', 'zoomAt', 100, 50, 2]
    ])
    wrapper.unmount()
  })

  // The snapshots read it after switching to another file.
  test('tells whether the picture on screen is ready', async () => {
    const ready = new Set(['preview-0'])
    const wrapper = mount(MultiPictureViewer, {
      props: {
        currentPreview: preview(1),
        previews: [preview(0), preview(1), preview(2)]
      },
      global: {
        stubs: {
          PictureViewer: {
            props: ['preview'],
            template: '<div />',
            methods: {
              isPictureReady() {
                return ready.has(this.preview.id)
              }
            }
          }
        }
      }
    })
    expect(wrapper.vm.isPictureReady()).toBe(false)

    ready.add('preview-1')

    expect(wrapper.vm.isPictureReady()).toBe(true)
    // Not mounted yet
    await wrapper.setProps({ currentPreview: preview(5) })
    expect(wrapper.vm.isPictureReady()).toBe(false)
    wrapper.unmount()
  })

  test('tells whether the picture on screen cannot load', async () => {
    const unavailable = new Set(['preview-0'])
    const wrapper = mount(MultiPictureViewer, {
      props: {
        currentPreview: preview(1),
        previews: [preview(0), preview(1), preview(2)]
      },
      global: {
        stubs: {
          PictureViewer: {
            props: ['preview'],
            template: '<div />',
            methods: {
              isPictureUnavailable() {
                return unavailable.has(this.preview.id)
              }
            }
          }
        }
      }
    })
    expect(wrapper.vm.isPictureUnavailable()).toBe(false)

    unavailable.add('preview-1')

    expect(wrapper.vm.isPictureUnavailable()).toBe(true)
    // Not mounted yet: it may still come.
    await wrapper.setProps({ currentPreview: preview(5) })
    expect(wrapper.vm.isPictureUnavailable()).toBe(false)
    wrapper.unmount()
  })
})
