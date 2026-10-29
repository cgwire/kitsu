import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import i18n from '@/lib/i18n'
// Pre-load the real store to avoid a circular-import race from child components.
import '@/lib/auth'

const diff = vi.hoisted(() => ({ loaded: false }))

vi.mock('diff2html', () => {
  diff.loaded = true
  return { html: () => '' }
})

vi.mock('@/store/api/files', () => ({
  default: { getPreviewFileText: vi.fn(() => Promise.resolve('')) }
}))

// Only diff previews need diff2html and its styles: no player may load them
// with every movie or picture.
describe('Diff viewer loading', () => {
  // Keep these first: diff2html stays loaded once a test shows a diff.
  it.each([
    [
      'PlaylistPlayer',
      () => import('@/components/players/players/PlaylistPlayer.vue')
    ],
    [
      'SharedPlaylistPlayer',
      () => import('@/components/players/players/SharedPlaylistPlayer.vue')
    ],
    [
      'PreviewViewer',
      () => import('@/components/players/viewers/PreviewViewer.vue')
    ]
  ])('leaves diff2html out of %s', async (name, importPlayer) => {
    await importPlayer()
    expect(diff.loaded).toBe(false)
  })

  it('loads diff2html once a diff preview shows', async () => {
    const { default: PreviewViewer } = await import(
      '@/components/players/viewers/PreviewViewer.vue'
    )
    const wrapper = shallowMount(PreviewViewer, {
      props: {
        preview: { id: 'preview-1', extension: 'diff', status: 'ready' }
      },
      global: { plugins: [i18n], stubs: { DiffViewer: false } }
    })
    await vi.dynamicImportSettled()
    await flushPromises()

    expect(diff.loaded).toBe(true)
    expect(wrapper.find('.diff-viewer').exists()).toBe(true)
    wrapper.unmount()
  })
})
