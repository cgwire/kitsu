import { shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import AssetTypeSettings from '@/components/pages/production/AssetTypeSettings.vue'
import ProductionSettings from '@/components/pages/ProductionSettings.vue'

const allAssetTypes = [
  { id: 'at-1', name: 'Character' },
  { id: 'at-2', name: 'Prop' },
  { id: 'at-3', name: 'Set' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'not-found', component: { template: '<div />' } },
    {
      path: '/settings',
      name: 'production-settings',
      component: { template: '<div />' }
    }
  ]
})

const mountWithAssetTypes = async assetTypeIds => {
  const store = createStore({
    getters: {
      assetTypes: () => allAssetTypes,
      currentProduction: () => ({
        id: 'prod-1',
        name: 'Test',
        asset_types: assetTypeIds,
        task_statuses: []
      }),
      isCurrentUserProductionManager: () => true,
      productionTaskStatuses: () => [],
      taskStatus: () => [],
      // Mirrors the real getter: an empty asset_types means "all".
      productionAssetTypes: () =>
        assetTypeIds.length
          ? allAssetTypes.filter(at => assetTypeIds.includes(at.id))
          : allAssetTypes
    }
  })
  store.dispatch = vi.fn()
  await router.push('/settings')
  await router.isReady()
  return shallowMount(ProductionSettings, {
    global: { plugins: [store, router], mocks: { $t: key => key } }
  })
}

describe('ProductionSettings — asset types tab', () => {
  // Regression: the tab must edit the production's explicit restriction set.
  // Feeding it productionAssetTypes (empty => every asset type) made the last
  // removal repaint the whole list and blocked removing asset types.
  it('passes an empty list when the production restricts no asset type', async () => {
    const wrapper = await mountWithAssetTypes([])
    expect(wrapper.findComponent(AssetTypeSettings).props('assetTypes')).toEqual(
      []
    )
  })

  it('passes only the explicit asset types, not every one', async () => {
    const wrapper = await mountWithAssetTypes(['at-2'])
    expect(
      wrapper.findComponent(AssetTypeSettings).props('assetTypes')
    ).toEqual([{ id: 'at-2', name: 'Prop' }])
  })
})
