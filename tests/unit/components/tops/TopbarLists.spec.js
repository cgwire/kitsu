import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

import '@/lib/auth'

import TopbarEpisodeList from '@/components/tops/TopbarEpisodeList.vue'
import TopbarSectionList from '@/components/tops/TopbarSectionList.vue'

// useRoute reads this object, so each mount sets the query it needs.
const route = vi.hoisted(() => ({ params: {}, query: {} }))

vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal()),
  useRoute: () => route
}))

const production = { id: 'production-1', production_type: 'tvshow' }

describe('TopbarEpisodeList', () => {
  const episodeGroups = [
    {
      name: '',
      episodeList: [
        { label: 'All assets', value: 'all' },
        { label: 'All shots', value: 'all', query: { for_entity: 'shot' } },
        { label: 'Main pack', value: 'main' }
      ]
    }
  ]

  const mountWith = query => {
    route.query = query
    return shallowMount(TopbarEpisodeList, {
      global: {
        plugins: [createStore({ getters: { currentProduction: () => production } })],
        mocks: { $t: key => key },
        // The episode dropdown stays closed, so router-link never renders,
        // yet Vue still resolves it at the top of the render fn.
        stubs: { RouterLink: true }
      },
      props: { episodeGroups, episodeId: 'all', section: 'playlists' }
    })
  }

  it('labels the all pseudo-episode from the route query', () => {
    expect(mountWith({}).vm.episodeLabel).toBe('All assets')
    expect(mountWith({ for_entity: 'shot' }).vm.episodeLabel).toBe('All shots')
  })

  it('carries the option query into the episode path', () => {
    const wrapper = mountWith({})
    const [allAssets, allShots] = episodeGroups[0].episodeList
    expect(wrapper.vm.getEpisodePath(allAssets).query).toBeUndefined()
    expect(wrapper.vm.getEpisodePath(allShots)).toMatchObject({
      params: { production_id: 'production-1', episode_id: 'all' },
      query: { for_entity: 'shot' }
    })
  })
})

describe('TopbarSectionList', () => {
  const playlists = { value: 'playlists', label: 'Playlists' }

  const mountWith = (section, query = {}) => {
    route.query = query
    return shallowMount(TopbarSectionList, {
      global: {
        plugins: [
          createStore({
            getters: {
              currentProduction: () => production
            },
            actions: {
              setCurrentSection: () => {},
              setLastProductionScreen: () => {}
            }
          })
        ],
        mocks: { $t: key => key },
        // The section dropdown stays closed, so router-link never renders,
        // yet Vue still resolves it at the top of the render fn.
        stubs: { RouterLink: true }
      },
      props: { sectionList: [playlists], section, episodeId: 'all' }
    })
  }

  it('keeps the shot side when going from all shots to the playlists', () => {
    expect(mountWith('shots').vm.getSectionPath(playlists)).toMatchObject({
      params: { episode_id: 'all' },
      query: { for_entity: 'shot' }
    })
    expect(
      mountWith('playlists', { for_entity: 'shot' }).vm.getSectionPath(
        playlists
      ).query
    ).toEqual({ for_entity: 'shot' })
  })

  it('lands on all assets from the asset side', () => {
    expect(mountWith('assets').vm.getSectionPath(playlists).query).toBeUndefined()
  })
})
