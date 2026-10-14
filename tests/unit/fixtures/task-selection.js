import {
  ADD_SELECTED_TASK,
  ADD_SELECTED_TASKS,
  CLEAR_SELECTED_TASKS,
  REMOVE_SELECTED_TASK
} from '@/store/mutation-types'
import tasksStore from '@/store/modules/tasks'

const pick = (source, names) =>
  Object.fromEntries(names.map(name => [name, source[name]]))

// The task selection of the tasks module, which the action panel changes:
// its state, getters, actions and mutations, to spread into a test store.
export const trackTaskSelection = () => {
  const state = {
    selectedTasks: new Map(),
    nbSelectedTasks: 0,
    selectedValidations: new Map(),
    nbSelectedValidations: 0
  }
  return {
    state,
    getters: pick(tasksStore.getters, ['nbSelectedTasks', 'selectedTasks']),
    actions: pick(tasksStore.actions, [
      'addSelectedTask',
      'addSelectedTasks',
      'clearSelectedTasks',
      'removeSelectedTask'
    ]),
    mutations: pick(tasksStore.mutations, [
      ADD_SELECTED_TASK,
      ADD_SELECTED_TASKS,
      CLEAR_SELECTED_TASKS,
      REMOVE_SELECTED_TASK
    ]),
    selectedIds: () => [...state.selectedTasks.keys()]
  }
}
