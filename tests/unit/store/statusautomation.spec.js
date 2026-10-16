// @vitest-environment node

import { computed, effectScope } from 'vue'
import { createStore } from 'vuex'

import statusAutomationStore from '@/store/modules/statusautomation'
import taskTypeStore from '@/store/modules/tasktypes'

import { LOAD_TASK_TYPES_END } from '@/store/mutation-types'

const ANIMATION = 'task-type-animation'
const LIGHTING = 'task-type-lighting'
const COMPOSITING = 'task-type-compositing'

// Global priorities, which Zou never reads to skip an automation.
const taskTypes = [
  { id: ANIMATION, name: 'Animation', for_entity: 'Shot', priority: 1 },
  { id: LIGHTING, name: 'Lighting', for_entity: 'Shot', priority: 2 },
  { id: COMPOSITING, name: 'Compositing', for_entity: 'Shot', priority: 3 }
]

const automation = (inTaskTypeId, outTaskTypeId, outFieldType = 'status') => ({
  id: 'automation-1',
  entity_type: 'shot',
  in_task_type_id: inTaskTypeId,
  out_field_type: outFieldType,
  out_task_type_id: outTaskTypeId
})

const production = taskTypesPriority => ({
  id: 'production-1',
  task_types_priority: taskTypesPriority
})

describe('Status automation store, isStatusAutomationDisabled', () => {
  let store
  let scope

  beforeEach(() => {
    store = createStore({
      modules: {
        productions: {
          state: { currentProduction: null },
          getters: { currentProduction: state => state.currentProduction },
          mutations: {
            setCurrentProduction(state, currentProduction) {
              state.currentProduction = currentProduction
            }
          }
        },
        statusAutomations: {
          state: { statusAutomations: [] },
          getters: statusAutomationStore.getters
        },
        taskTypes: {
          state: { taskTypes: [] },
          getters: taskTypeStore.getters,
          mutations: taskTypeStore.mutations
        }
      }
    })
    store.commit(LOAD_TASK_TYPES_END, taskTypes)
    scope = effectScope()
  })

  afterEach(() => {
    scope.stop()
  })

  // Read through a computed, as the automation lists do.
  const watchDisabled = statusAutomation =>
    scope.run(() =>
      computed(() => store.getters.isStatusAutomationDisabled(statusAutomation))
    )

  const isDisabledIn = (currentProduction, statusAutomation) => {
    store.commit('setCurrentProduction', currentProduction)
    return watchDisabled(statusAutomation).value
  }

  test('flags an input task type of strictly higher priority', () => {
    expect(
      isDisabledIn(
        production({ [LIGHTING]: 3, [ANIMATION]: 2 }),
        automation(LIGHTING, ANIMATION)
      )
    ).toBe(true)
  })

  test('lets equal priorities fire', () => {
    expect(
      isDisabledIn(
        production({ [LIGHTING]: 2, [ANIMATION]: 2 }),
        automation(LIGHTING, ANIMATION)
      )
    ).toBe(false)
  })

  test('lets missing priorities fire, as 0 against 0', () => {
    const statusAutomation = automation(LIGHTING, ANIMATION)
    expect(isDisabledIn(production({}), statusAutomation)).toBe(false)
    expect(
      isDisabledIn(production({ [LIGHTING]: null }), statusAutomation)
    ).toBe(false)
    expect(isDisabledIn({ id: 'production-1' }, statusAutomation)).toBe(false)
  })

  // Compositing comes after Animation globally, not in this production.
  test('ignores the global priority of the task types', () => {
    expect(
      isDisabledIn(
        production({ [ANIMATION]: 2 }),
        automation(ANIMATION, COMPOSITING)
      )
    ).toBe(true)
  })

  test('never flags a ready for automation', () => {
    expect(
      isDisabledIn(
        production({ [LIGHTING]: 3, [ANIMATION]: 2 }),
        automation(LIGHTING, ANIMATION, 'ready_for')
      )
    ).toBe(false)
  })

  test('follows a change of the current production', () => {
    store.commit(
      'setCurrentProduction',
      production({ [LIGHTING]: 3, [ANIMATION]: 2 })
    )
    const isDisabled = watchDisabled(automation(LIGHTING, ANIMATION))
    expect(isDisabled.value).toBe(true)

    store.commit(
      'setCurrentProduction',
      production({ [LIGHTING]: 1, [ANIMATION]: 2 })
    )
    expect(isDisabled.value).toBe(false)
  })
})
