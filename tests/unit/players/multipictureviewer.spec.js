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
})
