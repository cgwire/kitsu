import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import ProductionTaskTypes from '@/components/pages/production/ProductionTaskTypes.vue'
import SettingImporter from '@/components/widgets/SettingImporter.vue'

const assetTaskType = {
  id: 'asset-1',
  name: 'Modeling',
  for_entity: 'Asset'
}
const shotTaskTypes = [
  { id: 'shot-1', name: 'Animation', for_entity: 'Shot' },
  { id: 'shot-2', name: 'Lighting', for_entity: 'Shot' }
]
const newShotTaskType = {
  id: 'shot-3',
  name: 'Client Review',
  for_entity: 'Shot'
}
const taskTypes = [assetTaskType, ...shotTaskTypes, newShotTaskType]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/settings', component: { template: '<div />' } }]
})

const mountComponent = async () => {
  const currentProduction = {
    id: 'production-1',
    production_type: 'short',
    task_types: [assetTaskType.id, ...shotTaskTypes.map(taskType => taskType.id)]
  }
  const store = createStore({
    getters: {
      currentProduction: () => currentProduction,
      currentScheduleItems: () => [],
      getProductionTaskTypes: () => () => [],
      productionAssetTaskTypes: () => [assetTaskType],
      productionEditTaskTypes: () => [],
      productionEpisodeTaskTypes: () => [],
      productionSequenceTaskTypes: () => [],
      productionShotTaskTypes: () => shotTaskTypes,
      taskTypeMap: () => new Map(taskTypes.map(taskType => [taskType.id, taskType])),
      taskTypes: () => taskTypes
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())
  await router.push('/settings?section=shots')
  await router.isReady()
  const wrapper = shallowMount(ProductionTaskTypes, {
    global: { plugins: [store, router], mocks: { $t: key => key } }
  })
  await flushPromises()
  return { store, wrapper }
}

describe('ProductionTaskTypes', () => {
  it('appends a shot task type after the existing shot workflow', async () => {
    const { store, wrapper } = await mountComponent()

    wrapper.findComponent(SettingImporter).vm.$emit('import-item', newShotTaskType)
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('addTaskTypeToProduction', {
      taskTypeId: newShotTaskType.id,
      priority: 3
    })
  })
})
