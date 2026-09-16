import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

import '@/lib/auth'

import TopbarSectionList from '@/components/tops/TopbarSectionList.vue'

// useRoute reads this object, so each mount sets the query it needs.
const route = vi.hoisted(() => ({ params: {}, query: {} }))

vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal()),
  useRoute: () => route
}))

describe('TopbarSectionList', () => {
  const production = { id: 'production-1', production_type: 'tvshow' }
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
