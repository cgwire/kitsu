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

import RemoveTaskTypeModal from '@/components/modals/RemoveTaskTypeModal.vue'
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

  // A removed task type keeps its tasks, hidden from the lists and the
  // schedule: the removal tells how many remain and can delete them first.
  describe('removing a task type', () => {
    const removeAnimation = async (wrapper, answers = {}) => {
      wrapper.vm.$store.dispatch.mockImplementation(action =>
        action in answers ? answers[action]() : Promise.resolve()
      )
      const row = wrapper
        .findAllComponents(ProductionTaskType)
        .find(component => component.props('taskType').id === 'shot-1')
      row.vm.$emit('remove', {
        taskType: row.props('taskType'),
        scheduleItem: row.props('scheduleItem')
      })
      await flushPromises()
    }

    const actions = store =>
      store.dispatch.mock.calls
        .map(([action]) => action)
        .filter(action =>
          ['deleteAllTasks', 'removeTaskTypeFromProduction'].includes(action)
        )

    it('removes a task type with no task left right away', async () => {
      const { store, wrapper } = await mountComponent()

      await removeAnimation(wrapper, { countTasks: () => Promise.resolve(0) })

      expect(store.dispatch).toHaveBeenCalledWith('countTasks', {
        project_id: 'production-1',
        task_type_id: 'shot-1'
      })
      expect(actions(store)).toEqual(['removeTaskTypeFromProduction'])
      expect(wrapper.findComponent(RemoveTaskTypeModal).exists()).toBe(false)
    })

    it('keeps the remaining tasks when asked to', async () => {
      const { store, wrapper } = await mountComponent()

      await removeAnimation(wrapper, { countTasks: () => Promise.resolve(12) })
      const modal = wrapper.findComponent(RemoveTaskTypeModal)
      expect(modal.props('nbTasks')).toBe(12)
      expect(modal.props('taskType').id).toBe('shot-1')
      expect(actions(store)).toEqual([])

      modal.vm.$emit('confirm', false)
      await flushPromises()

      expect(actions(store)).toEqual(['removeTaskTypeFromProduction'])
      expect(wrapper.findComponent(RemoveTaskTypeModal).exists()).toBe(false)
    })

    it('deletes the remaining tasks before removing the task type', async () => {
      const { store, wrapper } = await mountComponent()

      await removeAnimation(wrapper, { countTasks: () => Promise.resolve(12) })
      wrapper.findComponent(RemoveTaskTypeModal).vm.$emit('confirm', true)
      await flushPromises()

      expect(store.dispatch).toHaveBeenCalledWith('deleteAllTasks', {
        projectId: 'production-1',
        taskTypeId: 'shot-1'
      })
      expect(actions(store)).toEqual([
        'deleteAllTasks',
        'removeTaskTypeFromProduction'
      ])
    })

    it('keeps the modal open while the tasks are being deleted', async () => {
      const { store, wrapper } = await mountComponent()
      let endDeletion

      await removeAnimation(wrapper, {
        countTasks: () => Promise.resolve(12),
        deleteAllTasks: () =>
          new Promise(resolve => {
            endDeletion = resolve
          })
      })
      const modal = wrapper.findComponent(RemoveTaskTypeModal)
      modal.vm.$emit('confirm', true)
      await flushPromises()
      expect(modal.props('isLoading')).toBe(true)

      modal.vm.$emit('cancel')
      await flushPromises()
      expect(wrapper.findComponent(RemoveTaskTypeModal).exists()).toBe(true)

      endDeletion()
      await flushPromises()
      expect(actions(store)).toEqual([
        'deleteAllTasks',
        'removeTaskTypeFromProduction'
      ])
      expect(wrapper.findComponent(RemoveTaskTypeModal).exists()).toBe(false)
    })

    it('keeps the task type when its tasks could not be deleted', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { store, wrapper } = await mountComponent()

      await removeAnimation(wrapper, {
        countTasks: () => Promise.resolve(12),
        deleteAllTasks: () => Promise.reject(new Error('Server error'))
      })
      wrapper.findComponent(RemoveTaskTypeModal).vm.$emit('confirm', true)
      await flushPromises()

      expect(actions(store)).toEqual(['deleteAllTasks'])
      const modal = wrapper.findComponent(RemoveTaskTypeModal)
      expect(modal.props('isError')).toBe(true)
      expect(modal.props('isLoading')).toBe(false)
      expect(consoleError).toHaveBeenCalled()
      consoleError.mockRestore()
    })

    it('keeps the task type when its tasks could not be counted', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { store, wrapper } = await mountComponent()

      await removeAnimation(wrapper, {
        countTasks: () => Promise.reject(new Error('Server error'))
      })

      expect(actions(store)).toEqual([])
      expect(wrapper.findComponent(RemoveTaskTypeModal).exists()).toBe(false)
      expect(wrapper.get('.error').text()).toBe('productions.edit_error')
      expect(consoleError).toHaveBeenCalled()
      consoleError.mockRestore()
    })
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
