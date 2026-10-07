import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

// Shows the interpolated values next to the key.
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key)
  })
}))

import ProductionTaskType from '@/components/pages/production/ProductionTaskType.vue'
import ProductionTaskTypes from '@/components/pages/production/ProductionTaskTypes.vue'
import InfoQuestionMark from '@/components/widgets/InfoQuestionMark.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
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

// Renders the rows the shallow mount would otherwise drop with the list.
const DraggableStub = {
  props: { modelValue: { type: Array, default: () => [] } },
  template: `<div>
    <slot
      name="item"
      :element="element"
      :key="index"
      v-for="(element, index) in modelValue"
    />
  </div>`
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/settings', component: { template: '<div />' } }]
})

const mountComponent = async (productionType = 'short', scheduleItems = []) => {
  const currentProduction = {
    id: 'production-1',
    production_type: productionType,
    task_types: [assetTaskType.id, ...shotTaskTypes.map(taskType => taskType.id)]
  }
  const store = createStore({
    getters: {
      currentProduction: () => currentProduction,
      currentScheduleItems: () => scheduleItems,
      getProductionTaskTypes: () => () => [],
      isTVShow: () => productionType === 'tvshow',
      // An instance whose MOVIE_HIGHDEF_BITRATE is above the usual 28.
      movieBitrateDefaults: () => ({
        hd_bitrate_compression: 40,
        ld_bitrate_compression: 8
      }),
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
    global: {
      plugins: [store, router],
      mocks: { $t: key => key },
      stubs: { draggable: DraggableStub }
    }
  })
  await flushPromises()
  return { store, wrapper }
}

const tabNames = wrapper =>
  wrapper
    .findComponent(RouteSectionTabs)
    .props('tabs')
    .map(tab => tab.name)

describe('ProductionTaskTypes', () => {
  it('hides the entity tabs the production type does not use', async () => {
    const { wrapper } = await mountComponent('short')
    expect(tabNames(wrapper)).toEqual(['assets', 'shots', 'sequences', 'edits'])

    const { wrapper: tvShow } = await mountComponent('tvshow')
    expect(tabNames(tvShow)).toContain('episodes')

    const { wrapper: shotsOnly } = await mountComponent('shots')
    expect(tabNames(shotsOnly)).toEqual(['shots', 'sequences', 'edits'])

    const { wrapper: assetsOnly } = await mountComponent('assets')
    expect(tabNames(assetsOnly)).toEqual(['assets'])
  })

  it('appends a shot task type after the existing shot workflow', async () => {
    const { store, wrapper } = await mountComponent()

    wrapper.findComponent(SettingImporter).vm.$emit('import-item', newShotTaskType)
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('addTaskTypeToProduction', {
      taskTypeId: newShotTaskType.id,
      priority: 3
    })
  })

  // The loaded items mix the task type bars with their entity bars: the row
  // must get the task type bar, or removing the task type deletes an entity
  // bar and leaves the task type bar behind.
  it('hands each task type row its own bar, not an entity bar', async () => {
    const sequenceBar = {
      id: 'sequence-bar',
      task_type_id: 'shot-1',
      object_id: 'sequence-1'
    }
    const taskTypeBar = {
      id: 'task-type-bar',
      task_type_id: 'shot-1',
      object_id: null
    }
    const { wrapper } = await mountComponent('short', [
      sequenceBar,
      taskTypeBar
    ])

    const row = wrapper
      .findAllComponents(ProductionTaskType)
      .find(component => component.props('taskType').id === 'shot-1')
    expect(row.props('scheduleItem')).toEqual(taskTypeBar)
  })

  it('explains the bitrate columns and gives their maximum', async () => {
    const { wrapper } = await mountComponent()
    const help = maximum =>
      `productions.video.task_type_bitrates\n\n${maximum}\n\n` +
      'productions.video.next_uploads_only'

    expect(
      wrapper.findAllComponents(InfoQuestionMark).map(item => item.props('text'))
    ).toEqual([
      help('productions.video.bitrate_max {"value":40}'),
      help('productions.video.task_type_ld_bitrate_max')
    ])
  })
})
