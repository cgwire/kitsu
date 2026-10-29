import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

// Pre-load the real store to avoid a circular-import race from the people store.
import '@/lib/auth'
import GlobalSearchField from '@/components/tops/GlobalSearchField.vue'

import { resetFullScreen, setFullScreenElement } from '../fixtures/full-screen'

describe('GlobalSearchField', () => {
  let wrapper = null

  const input = () => wrapper.find('input').element

  const pressShortcut = () =>
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, altKey: true })
    )

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    wrapper = shallowMount(GlobalSearchField, {
      attachTo: document.body,
      global: {
        mocks: { $t: key => key },
        plugins: [createStore({ getters: { productionMap: () => new Map() } })],
        stubs: { RouterLink: true }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
    resetFullScreen()
    delete document.exitFullscreen
    vi.useRealTimers()
  })

  it('focuses the search on its shortcut', () => {
    pressShortcut()

    expect(document.activeElement).toBe(input())
  })

  // The browser shows the element in full screen alone, the search hidden
  // behind it.
  describe('in full screen', () => {
    let player = null

    beforeEach(() => {
      player = document.body.appendChild(document.createElement('div'))
      document.exitFullscreen = vi.fn(() => Promise.resolve())
      setFullScreenElement(player)
    })

    afterEach(() => {
      player.remove()
    })

    it('leaves the full screen first', () => {
      pressShortcut()

      expect(document.exitFullscreen).toHaveBeenCalled()
      expect(document.activeElement).not.toBe(input())
    })

    // A player blurs the page as its full screen ends.
    it('focuses the search once the player is done with the end', async () => {
      pressShortcut()
      setFullScreenElement(null)
      await nextTick()
      document.activeElement.blur()
      vi.runAllTimers()

      expect(document.activeElement).toBe(input())
    })

    // AltGr+F types a character on some layouts, and Windows reports AltGr
    // as Ctrl+Alt.
    it('leaves a key typed in a field to the field', () => {
      const box = player.appendChild(document.createElement('textarea'))
      box.focus()

      box.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: '[',
          code: 'KeyF',
          ctrlKey: true,
          altKey: true,
          bubbles: true
        })
      )

      expect(document.exitFullscreen).not.toHaveBeenCalled()
    })

    // Cmd+Option+F types nothing on macOS.
    it('takes the shortcut with Cmd from a field', () => {
      const box = player.appendChild(document.createElement('textarea'))
      box.focus()

      box.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ƒ',
          code: 'KeyF',
          metaKey: true,
          altKey: true,
          bubbles: true
        })
      )

      expect(document.exitFullscreen).toHaveBeenCalled()
    })

    // Like the "+" modal's video, in full screen over the player.
    it('drops the focus when the exit leaves another full screen', async () => {
      pressShortcut()
      setFullScreenElement(document.createElement('div'))
      await nextTick()
      setFullScreenElement(null)
      await nextTick()
      vi.runAllTimers()

      expect(document.activeElement).not.toBe(input())
    })
  })
})
