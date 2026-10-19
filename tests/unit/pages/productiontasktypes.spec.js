import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  dropBefore,
  isArmed,
  pressOn,
  recordListenerErrors,
  release,
  startDrag
} from '../fixtures/sortable'

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

const mountComponent = async (
  productionType = 'short',
  scheduleItems = [],
  stubs = { draggable: DraggableStub },
  errorHandler = undefined
) => {
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
      config: { errorHandler },
      plugins: [store, router],
      mocks: { $t: key => key },
      stubs
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

const workflow = ['Layout', 'Animation', 'Lighting', 'Compositing'].map(
  (name, index) => ({
    id: name.toLowerCase(),
    name,
    short_name: name.slice(0, 3).toUpperCase(),
    for_entity: 'Shot',
    priority: index + 1
  })
)

// Mounts the real vuedraggable and rows, so that SortableJS handles them.
// A commit of setShotTaskTypeIds plays a reload of the production, which
// lists its task types in that order.
const mountWorkflow = async ({ errorHandler, ...options } = {}) => {
  const store = createStore({
    state: { shotTaskTypeIds: workflow.map(taskType => taskType.id) },
    getters: {
      currentProduction: state => ({
        id: 'production-1',
        production_type: 'short',
        task_types: state.shotTaskTypeIds,
        task_types_priority: Object.fromEntries(
          state.shotTaskTypeIds.map((id, index) => [id, index + 1])
        )
      }),
      currentScheduleItems: () => [],
      getProductionTaskTypes: () => () => [],
      isTVShow: () => false,
      movieBitrateDefaults: () => ({
        hd_bitrate_compression: 40,
        ld_bitrate_compression: 8
      }),
      productionAssetTaskTypes: () => [],
      productionEditTaskTypes: () => [],
      productionEpisodeTaskTypes: () => [],
      productionSequenceTaskTypes: () => [],
      productionShotTaskTypes: state =>
        workflow.filter(taskType => state.shotTaskTypeIds.includes(taskType.id)),
      taskTypeMap: () =>
        new Map(workflow.map(taskType => [taskType.id, taskType])),
      taskTypes: () => workflow
    },
    mutations: {
      setShotTaskTypeIds: (state, ids) => {
        state.shotTaskTypeIds = ids
      },
      SORT_VALIDATION_COLUMNS: () => {}
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())
  await router.push('/settings?section=shots')
  await router.isReady()
  const wrapper = shallowMount(ProductionTaskTypes, {
    global: {
      config: { errorHandler },
      plugins: [store, router],
      mocks: { $t: key => key },
      stubs: { draggable: false, ProductionTaskType: false }
    },
    ...options
  })
  await flushPromises()
  const rows = () => wrapper.findAll('tr.task-type')
  const names = () => rows().map(row => row.find('td.short-name').text())
  return { names, rows, store, wrapper }
}

describe('ProductionTaskTypes', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

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

    // A task type without a bar of its own gets a placeholder with no id:
    // deleting it sent DELETE /schedule-items/undefined.
    it('deletes the bar of the task type only when it has one', async () => {
      const taskTypeBar = {
        id: 'task-type-bar',
        task_type_id: 'shot-1',
        object_id: null
      }
      const withBar = await mountComponent('short', [taskTypeBar])
      await removeAnimation(withBar.wrapper, {
        countTasks: () => Promise.resolve(0)
      })
      expect(withBar.store.dispatch).toHaveBeenCalledWith(
        'deleteScheduleItem',
        taskTypeBar
      )

      const withoutBar = await mountComponent()
      await removeAnimation(withoutBar.wrapper, {
        countTasks: () => Promise.resolve(0)
      })
      expect(
        withoutBar.store.dispatch.mock.calls.map(([action]) => action)
      ).not.toContain('deleteScheduleItem')
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

  // A held Remove button must not arm a drag: the list reloads after a
  // removal, and rows shifting before the release crashed vuedraggable
  // (see productionsettings.spec.js).
  it('drags a row from its grip but not from its Remove button', async () => {
    const { wrapper } = await mountComponent('short', [], {
      draggable: false,
      ProductionTaskType: false
    })
    const [row] = wrapper.findAll('tr.task-type')

    pressOn(row.find('td.grab').element)
    expect(isArmed(row)).toBe(true)
    release()

    pressOn(row.find('td.remove button').element)
    expect(isArmed(row)).toBe(false)
    release()
  })

  // Regression: vuedraggable moves the row found at the index the dragged
  // row had when its drag started. A reload that rebuilt the list meanwhile
  // made it move an undefined row, and saving the order threw.
  it('saves the dropped order when a reload removes a row during the drag', async () => {
    const { names, rows, store } = await mountWorkflow()
    const [first, , , last] = rows().map(row => row.element)

    const errors = await recordListenerErrors(async () => {
      await startDrag(last.querySelector('td.short-name'))
      store.commit('setShotTaskTypeIds', ['layout', 'lighting', 'compositing'])
      await flushPromises()
      dropBefore(last, first)
      await flushPromises()
    })

    expect(errors).toEqual([])
    expect(names()).toEqual(['COM', 'LAY', 'ANI', 'LIG'])
    expect(store.dispatch).toHaveBeenCalledWith('reorderTaskTypeLinks', {
      projectId: 'production-1',
      taskTypeIds: ['compositing', 'layout', 'animation', 'lighting']
    })

    // The reload that follows the save.
    store.commit('setShotTaskTypeIds', ['compositing', 'layout', 'lighting'])
    await flushPromises()
    expect(names()).toEqual(['COM', 'LAY', 'LIG'])
  })

  // Regression: a failed save brings no reload, so the list kept what it
  // showed during the drag, a task type removed meanwhile included.
  it('rebuilds the list from the production when the save fails', async () => {
    const errorHandler = vi.fn()
    const { names, rows, store } = await mountWorkflow({ errorHandler })
    const error = new Error('Bad Gateway')
    store.dispatch.mockImplementation(async action => {
      if (action === 'reorderTaskTypeLinks') throw error
    })
    const [first, , , last] = rows().map(row => row.element)

    await startDrag(last.querySelector('td.short-name'))
    store.commit('setShotTaskTypeIds', ['layout', 'lighting', 'compositing'])
    await flushPromises()
    dropBefore(last, first)
    await flushPromises()

    expect(errorHandler.mock.calls[0][0]).toBe(error)
    expect(names()).toEqual(['LAY', 'LIG', 'COM'])
  })

  it('shows a reload that came during a press once the row is released', async () => {
    const { names, rows, store } = await mountWorkflow()

    pressOn(rows()[1].find('td.short-name').element)
    store.commit('setShotTaskTypeIds', ['layout', 'lighting', 'compositing'])
    await flushPromises()
    expect(names()).toEqual(['LAY', 'ANI', 'LIG', 'COM'])

    release()
    await flushPromises()
    expect(names()).toEqual(['LAY', 'LIG', 'COM'])
  })

  // Regression: the rows had no key, so a reload that moved them rebuilt
  // the rows of the task types that changed places.
  it('keeps the focus in a bitrate field when a reload moves its row', async () => {
    const { names, rows, store, wrapper } = await mountWorkflow({
      attachTo: document.body
    })
    const lighting = rows()[2]
    const input = lighting.find('td.bitrate input').element
    input.focus()
    expect(document.activeElement).toBe(input)

    store.commit('setShotTaskTypeIds', ['animation', 'lighting', 'compositing'])
    await flushPromises()

    expect(names()).toEqual(['ANI', 'LIG', 'COM'])
    expect(rows()[1].element).toBe(lighting.element)
    expect(document.activeElement).toBe(input)
    wrapper.unmount()
  })

  // Regression: a reorder dropped while another was being saved left a flag
  // up for good, after which each save sent its order once more, again and
  // again while the server took more than a second to answer.
  it('stops sending the order once it is saved on a slow server', async () => {
    const { store, wrapper } = await mountComponent()
    const list = wrapper.findComponent(DraggableStub)
    const [animation, lighting] = list.props('modelValue')
    const drop = items => {
      list.vm.$emit('update:modelValue', items)
      list.vm.$emit('end')
    }
    store.commit = vi.fn()
    vi.useFakeTimers()
    store.dispatch.mockImplementation(action =>
      action === 'reorderTaskTypeLinks'
        ? new Promise(resolve => setTimeout(resolve, 1500))
        : Promise.resolve()
    )

    drop([lighting, animation])
    await vi.advanceTimersByTimeAsync(500)
    drop([animation, lighting])
    await vi.advanceTimersByTimeAsync(20000)

    const reorders = store.dispatch.mock.calls.filter(
      ([action]) => action === 'reorderTaskTypeLinks'
    )
    expect(reorders).toHaveLength(2)
  })

  // Regression: a reorder dropped less than a second after the previous one,
  // or during its save, was never sent, and the reload that followed the
  // drop put the rows back.
  it('saves each reorder before reloading, the last one last', async () => {
    const { store, wrapper } = await mountComponent()
    const list = wrapper.findComponent(DraggableStub)
    const [animation, lighting] = list.props('modelValue')
    const drop = items => {
      list.vm.$emit('update:modelValue', items)
      list.vm.$emit('end')
    }
    const calls = []
    let saving = 0
    let mostSaving = 0
    store.commit = vi.fn()
    vi.useFakeTimers()
    store.dispatch.mockImplementation((action, payload) => {
      if (action !== 'reorderTaskTypeLinks') {
        calls.push(action)
        return Promise.resolve()
      }
      calls.push(payload.taskTypeIds.join(','))
      mostSaving = Math.max(mostSaving, ++saving)
      return new Promise(resolve =>
        setTimeout(() => {
          saving--
          resolve()
        }, 200)
      )
    })

    drop([lighting, animation])
    await vi.advanceTimersByTimeAsync(300)
    drop([animation, lighting])
    await vi.advanceTimersByTimeAsync(100)
    drop([lighting, animation])
    await vi.advanceTimersByTimeAsync(5000)

    expect(calls).toEqual([
      'shot-2,shot-1',
      'loadContext',
      'shot-1,shot-2',
      'shot-2,shot-1',
      'loadContext',
      'loadContext'
    ])
    expect(mostSaving).toBe(1)
  })

  // Regression: an order waiting for a save went to the production shown
  // once it was sent, another one after a switch.
  it('saves a reorder to the production it was dropped in', async () => {
    const { store, wrapper } = await mountComponent()
    const list = wrapper.findComponent(DraggableStub)
    const [animation, lighting] = list.props('modelValue')
    const drop = items => {
      list.vm.$emit('update:modelValue', items)
      list.vm.$emit('end')
    }
    store.commit = vi.fn()
    vi.useFakeTimers()
    store.dispatch.mockImplementation(action =>
      action === 'reorderTaskTypeLinks'
        ? new Promise(resolve => setTimeout(resolve, 200))
        : Promise.resolve()
    )

    drop([lighting, animation])
    drop([animation, lighting])
    store.getters.currentProduction.id = 'production-2'
    await vi.advanceTimersByTimeAsync(1000)

    const projectIds = store.dispatch.mock.calls
      .filter(([action]) => action === 'reorderTaskTypeLinks')
      .map(([, { projectId }]) => projectId)
    expect(projectIds).toEqual(['production-1', 'production-1'])
  })

  // Regression: one queue served every list, so a drop on another list took
  // the place of an order still waiting for its save.
  test.each([
    [
      'production',
      async store => {
        store.getters.currentProduction.id = 'production-2'
      },
      'production-2:shot-2,shot-1'
    ],
    [
      'entity',
      async () => {
        await router.push('/settings?section=assets')
        await vi.advanceTimersByTimeAsync(0)
      },
      'production-1:asset-1'
    ]
  ])(
    'saves the waiting order of a list after a drop for another %s',
    async (name, switchList, otherOrder) => {
      const { store, wrapper } = await mountComponent()
      const list = () => wrapper.findComponent(DraggableStub)
      const drop = items => {
        list().vm.$emit('update:modelValue', items)
        list().vm.$emit('end')
      }
      const [animation, lighting] = list().props('modelValue')
      store.commit = vi.fn()
      vi.useFakeTimers()
      store.dispatch.mockImplementation(action =>
        action === 'reorderTaskTypeLinks'
          ? new Promise(resolve => setTimeout(resolve, 200))
          : Promise.resolve()
      )

      drop([lighting, animation])
      drop([animation, lighting])
      await switchList(store)
      drop(name === 'production' ? [lighting, animation] : list().props('modelValue'))
      await vi.advanceTimersByTimeAsync(1000)

      const orders = store.dispatch.mock.calls
        .filter(([action]) => action === 'reorderTaskTypeLinks')
        .map(([, order]) => `${order.projectId}:${order.taskTypeIds.join(',')}`)
      expect(orders).toHaveLength(3)
      expect(orders).toEqual(
        expect.arrayContaining(['production-1:shot-1,shot-2', otherOrder])
      )
    }
  )

  // Regression: a failed save failed the reorder dropped after it too, which
  // Zou had saved: the lists went back to a production never reloaded.
  it('reloads the production when a save fails', async () => {
    const errorHandler = vi.fn()
    const { store, wrapper } = await mountComponent(
      'short',
      [],
      undefined,
      errorHandler
    )
    const list = wrapper.findComponent(DraggableStub)
    const [animation, lighting] = list.props('modelValue')
    const drop = items => {
      list.vm.$emit('update:modelValue', items)
      list.vm.$emit('end')
    }
    const error = new Error('Bad Gateway')
    const calls = []
    store.commit = vi.fn()
    vi.useFakeTimers()
    store.dispatch.mockImplementation(action => {
      calls.push(action)
      if (action !== 'reorderTaskTypeLinks') return Promise.resolve()
      const isFirst = calls.filter(call => call === action).length === 1
      return new Promise((resolve, reject) => {
        setTimeout(() => (isFirst ? reject(error) : resolve()), 200)
      })
    })

    drop([lighting, animation])
    drop([animation, lighting])
    await vi.advanceTimersByTimeAsync(1000)

    expect(calls).toEqual([
      'reorderTaskTypeLinks',
      'reorderTaskTypeLinks',
      'loadContext',
      'loadContext'
    ])
    expect(errorHandler.mock.calls[0][0]).toBe(error)
  })
})
