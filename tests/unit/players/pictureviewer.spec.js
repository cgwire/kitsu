import { flushPromises, mount } from '@vue/test-utils'
import process from 'node:process'
import { nextTick, reactive } from 'vue'

import PictureViewer from '@/components/players/viewers/PictureViewer.vue'

const preview = id => ({ id, extension: 'png' })

describe('players/PictureViewer', () => {
  test('uses black by default and applies the selected background color', async () => {
    const wrapper = mount(PictureViewer)

    expect(wrapper.find('.picture-wrapper').element.style.backgroundColor).toBe(
      'rgb(0, 0, 0)'
    )

    await wrapper.setProps({ backgroundColor: '#FFFFFF' })

    expect(wrapper.find('.picture-wrapper').element.style.backgroundColor).toBe(
      'rgb(255, 255, 255)'
    )
  })

  test('survives a teardown between a preview change and its deferred reset in fullscreen', async () => {
    const rejections = []
    const onRejection = reason => rejections.push(reason)
    process.on('unhandledRejection', onRejection)

    const wrapper = mount(PictureViewer, {
      props: { fullScreen: true, preview: preview('preview-1') }
    })
    // The preview watcher defers its reset with nextTick. The viewer can be
    // unmounted before that callback runs (MultiPictureViewer strip window,
    // player teardown), which the unmount right after the flush mimics.
    await wrapper.setProps({ preview: preview('preview-2') })
    wrapper.unmount()
    // Node reports a rejected promise once the microtask queue has drained.
    await new Promise(resolve => setTimeout(resolve))
    process.off('unhandledRejection', onRejection)

    expect(rejections).toEqual([])
  })

  // Zou builds the variants of an uploaded picture in the background, and
  // the side panels flip the status of the preview in place, under its id.
  test('loads the picture of a preview that turns ready', async () => {
    const processingPreview = reactive({
      ...preview('preview-1'),
      status: 'processing'
    })
    const wrapper = mount(PictureViewer, {
      props: { preview: processingPreview }
    })
    const picture = '/api/pictures/previews/preview-files/preview-1.png'
    expect(wrapper.find(`img[src="${picture}"]`).exists()).toBe(false)

    processingPreview.status = 'ready'
    await nextTick()

    expect(wrapper.find(`img[src="${picture}"]`).exists()).toBe(true)
  })

  // A snapshot draws the picture, and an engine can know the size of a
  // picture before the whole file is in.
  test('is ready for a snapshot once the whole picture is in', async () => {
    const wrapper = mount(PictureViewer, {
      props: { preview: preview('preview-1') }
    })
    await nextTick()
    const picture = wrapper.vm.getPictureElement()
    Object.defineProperty(picture, 'naturalWidth', { value: 800 })
    Object.defineProperty(picture, 'complete', {
      configurable: true,
      value: false
    })
    expect(wrapper.vm.isPictureReady()).toBe(false)

    Object.defineProperty(picture, 'complete', { value: true })

    expect(wrapper.vm.isPictureReady()).toBe(true)
    wrapper.unmount()
  })

  // A snapshot does not wait for a picture that will not come: Zou could not
  // build it or still builds it, or the browser could not fetch or decode it.
  test('tells a picture that cannot load', async () => {
    const wrapper = mount(PictureViewer, {
      props: { preview: { ...preview('preview-1'), status: 'processing' } }
    })
    expect(wrapper.vm.isPictureUnavailable()).toBe(true)

    await wrapper.setProps({ preview: preview('preview-2') })
    // Between two files, the <img> has no src: complete, with no size.
    expect(wrapper.vm.isPictureUnavailable()).toBe(false)
    await flushPromises()
    const picture = wrapper.vm.getPictureElement()
    Object.defineProperty(picture, 'complete', {
      configurable: true,
      value: false
    })
    expect(wrapper.vm.isPictureUnavailable()).toBe(false)

    // A broken <img> is complete, with no size.
    Object.defineProperty(picture, 'complete', { value: true })

    expect(wrapper.vm.isPictureUnavailable()).toBe(true)
    wrapper.unmount()
  })
})
