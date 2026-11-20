import { flushPromises, RouterLinkStub, shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

// Pre-load the real store to avoid a circular-import race from the people store.
import '@/lib/auth'
import { markRequestFailure } from '@/lib/errors'
import GlobalSearchField from '@/components/tops/GlobalSearchField.vue'

import { resetFullScreen, setFullScreenElement } from '../fixtures/full-screen'

describe('GlobalSearchField', () => {
  let wrapper = null
  // The searches sent, each answered when a test says so.
  let searches = []

  const input = () => wrapper.find('input').element

  const pressShortcut = () =>
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, altKey: true })
    )

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    searches = []
    const store = createStore({
      getters: { productionMap: () => new Map() },
      actions: {
        searchData: (_, { query }) =>
          new Promise((resolve, reject) => {
            searches.push({ query, resolve, reject })
          })
      }
    })
    wrapper = shallowMount(GlobalSearchField, {
      attachTo: document.body,
      global: { plugins: [store], stubs: { RouterLink: RouterLinkStub } }
    })
  })

  afterEach(() => {
    wrapper.unmount()
    resetFullScreen()
    delete document.exitFullscreen
    vi.useRealTimers()
    vi.restoreAllMocks()
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

  // A slow server can answer a search after the next one has started.
  describe('search answers', () => {
    const found = (...names) => ({
      assets: names.map(name => ({
        id: name,
        name,
        asset_type_name: 'Props',
        project_id: 'production-1',
        project_name: 'Big Buck'
      })),
      persons: [],
      shots: []
    })
    const shownNames = () =>
      wrapper.findAll('.asset-type-name').map(line => line.text())
    const type = async query => {
      await wrapper.find('input').setValue(query)
      await flushPromises()
    }
    const answer = async (search, result) => {
      search.resolve(result)
      await flushPromises()
    }

    it('shows the results of the last query when an older one answers last', async () => {
      await type('cha')
      await type('chair')
      await answer(searches[1], found('Chair'))
      await answer(searches[0], found('Chain', 'Chalk'))

      expect(searches.map(search => search.query)).toEqual(['cha', 'chair'])
      expect(shownNames()).toEqual(['Props / Chair'])
    })

    it('keeps loading when an older query answers first', async () => {
      await type('cha')
      await type('chair')
      await answer(searches[0], found('Chain'))

      expect(wrapper.find('.search-loader').exists()).toBe(true)
      expect(shownNames()).toEqual([])

      await answer(searches[1], found('Chair'))

      expect(wrapper.find('.search-loader').exists()).toBe(false)
      expect(shownNames()).toEqual(['Props / Chair'])
    })

    it('keeps loading when an older query fails first', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const failure = new Error('Service Unavailable')
      markRequestFailure(failure)
      await type('cha')
      await type('chair')
      searches[0].reject(failure)
      await flushPromises()

      expect(console.error).toHaveBeenCalledWith(failure)
      expect(wrapper.find('.search-loader').exists()).toBe(true)

      await answer(searches[1], found('Chair'))

      expect(wrapper.find('.search-loader').exists()).toBe(false)
      expect(shownNames()).toEqual(['Props / Chair'])
    })

    it('leaves no result of a query erased before it answered', async () => {
      await type('cha')
      await type('')
      await answer(searches[0], found('Chain', 'Chalk', 'Chair'))

      expect(wrapper.find('.search-results').attributes('style')).toContain(
        'min-height: 60px'
      )
    })

    describe('when the last query fails', () => {
      const person = name => ({ id: name, first_name: name, last_name: 'Doe' })
      const shot = name => ({
        id: name,
        name,
        sequence_name: 'SQ01',
        project_id: 'production-1',
        project_name: 'Big Buck'
      })

      beforeEach(async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const failure = new Error('Service Unavailable')
        markRequestFailure(failure)
        await type('cha')
        // Two of each kind: a kind left on the list keeps the box taller.
        await answer(searches[0], {
          assets: found('Chain', 'Chalk').assets,
          persons: [person('Chad'), person('Charlie')],
          shots: [shot('SH010'), shot('SH020')]
        })
        await type('chair')
        searches[1].reject(failure)
        await flushPromises()
        expect(console.error).toHaveBeenCalledWith(failure)
      })

      it('shows an error instead of the results of the query before', () => {
        const box = wrapper.find('.search-results')

        expect(shownNames()).toEqual([])
        expect(box.text()).toBe('main.loading_error')
        // sized for the one line it shows
        expect(box.attributes('style')).toContain('min-height: 60px')
      })

      it('shows the results of the next query', async () => {
        await type('chairs')
        await answer(searches[2], found('Chairs'))

        expect(shownNames()).toEqual(['Props / Chairs'])
        expect(wrapper.find('.search-results').text()).not.toContain(
          'main.loading_error'
        )
      })
    })
  })
})
