import { shallowMount, createLocalVue } from '@vue/test-utils'
import vuescroll from 'vue-scroll'
import Vuex from 'vuex'
import i18n from '@/lib/i18n'
import auth from '@/lib/auth'
import Breakdown from '@/components/pages/Breakdown'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(vuescroll)

describe('Breakdown', () => {
  let store, assetStore, userStore, shotStore, castingStore, productionStore
  let getters

  beforeEach(() => {
    userStore = {
      getters: {
        isCurrentUserManager: () => true,
        isShowInfosBreakdown: () => false
      },
      actions: {
        setLastProductionScreen: () => true
      }
    }
    productionStore = {
      getters: {
        currentProduction: () => ({ id: 'production-1', name: 'Prod 1' }),
        isTVShow: () => (true)
      },
      actions: {
      }
    }
    assetStore = {
      getters: {
        assetsByType: () => ([]),
        castingAssetTypesOptions: () => ([]),
        castingSequencesOptions: () => ([]),
        currentEpisode: () => ([]),
        isAssetsLoading: () => ([])
      },
      actions: {
      }
    }
    shotStore = {
      getters: {
        sequences: () => ([]),
        curentEpisode: () => ({}),
        shotMetadataDescriptors: () => ([])
      },
      actions: {
      }
    }
    castingStore = {
      getters: {
        castingSequenceOptions: () => ([]),
        castingSequenceShots: () => ([])
      },
      actions: {
      }
    }
    store = new Vuex.Store({
      strict: true,
      modules: {
        assets: assetStore,
        breakdown: castingStore,
        productions: productionStore,
        shots: shotStore,
        user: userStore
      }
    })

    getters = {
      castingSequenceOptions: []
    }

    shallowMount(Breakdown, {
      store,
      getters,
      localVue,
      i18n,
      auth
    })
  })

  describe('Mount', () => {
    test('mounted', () => {
    })
  })

  describe('Getters', () => {
    test.skip('availableAssetsByType', () => {
    })
    test.skip('exportUrlPath', () => {
    })
    test.skip('isAssetCasting', () => {
    })
    test.skip('isShotCasting', () => {
    })
    test.skip('castingEntities', () => {
    })
  })

  describe('Methods', () => {
    test('loadFollowingNews', () => {
    })
  })
})
