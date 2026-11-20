import { flushPromises, RouterLinkStub, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import { markRequestFailure } from '@/lib/errors'

import EntitySearch from '@/components/pages/EntitySearch.vue'
import Spinner from '@/components/widgets/Spinner.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() })
}))

const asset = name => ({
  id: name,
  name,
  asset_type_name: 'Props',
  matched_terms: [name],
  project_id: 'production-1',
  project_name: 'Big Buck'
})

const shot = name => ({
  id: name,
  name,
  sequence_name: 'SQ01',
  matched_terms: [name],
  project_id: 'production-1',
  project_name: 'Big Buck'
})

// A full page of the default limit, which offers to load more.
const page = (prefix, entity = asset) =>
  Array.from({ length: 12 }, (_, index) => entity(`${prefix} ${index + 1}`))

// A slow server can answer a search after the next one has started.
describe('pages/EntitySearch', () => {
  let wrapper
  // The searches sent, each answered when a test says so.
  let searches

  const shownNames = () =>
    wrapper.findAll('.entity-name').map(line => line.text())
  const isLoading = () => wrapper.findComponent(Spinner).exists()
  const loadMoreButton = () => wrapper.find('button.is-link')
  const type = async query => {
    await wrapper.find('input').setValue(query)
    await flushPromises()
  }
  const answer = async (search, assets, shots = []) => {
    search.resolve({ assets, shots, persons: [] })
    await flushPromises()
  }
  const loadMore = async () => {
    await loadMoreButton().trigger('click')
    await flushPromises()
  }

  beforeEach(() => {
    searches = []
    const store = createStore({
      getters: {
        openProductions: () => [],
        productionMap: () =>
          new Map([
            ['production-1', { id: 'production-1', production_type: 'short' }]
          ])
      },
      actions: {
        searchData: (_, payload) =>
          new Promise((resolve, reject) => {
            searches.push({ ...payload, resolve, reject })
          })
      }
    })
    wrapper = shallowMount(EntitySearch, {
      global: { plugins: [store], stubs: { RouterLink: RouterLinkStub } }
    })
  })

  afterEach(() => {
    wrapper.unmount()
    vi.restoreAllMocks()
  })

  test('shows the results of the last search when an older one answers last', async () => {
    await type('cha')
    await type('chair')
    await answer(searches[1], [asset('Chair')])
    await answer(searches[0], [asset('Chain'), asset('Chalk')])

    expect(searches.map(search => search.query)).toEqual(['cha', 'chair'])
    expect(shownNames()).toEqual(['Props / Chair'])
  })

  test('keeps loading when an older search answers first', async () => {
    await type('cha')
    await type('chair')
    await answer(searches[0], [asset('Chain')])

    expect(isLoading()).toBe(true)

    await answer(searches[1], [asset('Chair')])

    expect(isLoading()).toBe(false)
    expect(shownNames()).toEqual(['Props / Chair'])
  })

  test('keeps loading when an older search fails first', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = new Error('Service Unavailable')
    markRequestFailure(failure)
    await type('cha')
    await type('chair')
    searches[0].reject(failure)
    await flushPromises()

    expect(console.error).toHaveBeenCalledWith(failure)
    expect(isLoading()).toBe(true)

    await answer(searches[1], [asset('Chair')])

    expect(isLoading()).toBe(false)
    expect(shownNames()).toEqual(['Props / Chair'])
  })

  describe('when the last search fails', () => {
    beforeEach(async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const failure = new Error('Service Unavailable')
      markRequestFailure(failure)
      await type('cha')
      await answer(searches[0], [asset('Chain')])
      await type('chair')
      searches[1].reject(failure)
      await flushPromises()
      expect(console.error).toHaveBeenCalledWith(failure)
    })

    test('shows an error instead of the results of the search before', () => {
      expect(shownNames()).toEqual([])
      expect(wrapper.find('.search-results').text()).toBe('main.loading_error')
    })

    test('shows the results of the next search', async () => {
      await type('chairs')
      await answer(searches[2], [asset('Chairs')])

      expect(shownNames()).toEqual(['Props / Chairs'])
      expect(wrapper.find('.search-results').text()).not.toContain(
        'main.loading_error'
      )
    })
  })

  describe('load more', () => {
    beforeEach(async () => {
      await type('cha')
      await answer(searches[0], page('Chain'))
      await loadMore()
    })

    test('adds more results only to the search they were loaded for', async () => {
      await type('chair')
      await answer(searches[2], [asset('Chair')])
      await answer(searches[1], page('Chalk'))

      expect(searches[1]).toMatchObject({ offset: 12, index_names: ['assets'] })
      expect(shownNames()).toEqual(['Props / Chair'])
    })

    test('offers to load more for a new search at once', async () => {
      await type('chair')
      await answer(searches[2], page('Chair'))

      expect(loadMoreButton().exists()).toBe(true)
    })

    test('keeps loading more for a new search when an older load answers', async () => {
      await type('chair')
      await answer(searches[2], page('Chair'))
      await loadMore()
      await answer(searches[1], page('Chalk'))

      expect(loadMoreButton().exists()).toBe(false)
      expect(shownNames()).toHaveLength(12)

      await answer(searches[3], page('Chair more'))

      expect(loadMoreButton().exists()).toBe(true)
      expect(shownNames()).toHaveLength(24)
    })
  })

  test('offers to load more shots for a new search at once', async () => {
    await type('cha')
    await answer(searches[0], [], page('Chain', shot))
    await loadMore()
    await type('chair')
    await answer(searches[2], [], page('Chair', shot))

    expect(searches[1]).toMatchObject({ offset: 12, index_names: ['shots'] })
    expect(loadMoreButton().exists()).toBe(true)
  })
})
