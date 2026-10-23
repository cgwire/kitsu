import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { pauseEvent } from '@/composables/dom'
import { range } from '@/lib/time'

/*
 * Row selection of the task lists. The fields typed in the rows change the
 * highlighted rows (selectionGrid) and the action panel changes the store
 * selection: every click and Alt+Arrow updates both alike.
 *
 * tasks: getter of the listed tasks.
 * body: template ref of the list body, which holds the row fields.
 * emit: emit of the list, for its task-selected event.
 * onSelect(task): optional, runs after each selection.
 */
export const useTaskListSelection = ({ tasks, body, emit, onSelect }) => {
  const store = useStore()

  // State
  // --------------------------------------------------------------------------
  const lastSelection = ref(null)
  const selectionGrid = ref({})

  // Computed
  // --------------------------------------------------------------------------
  const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)

  // Functions
  // --------------------------------------------------------------------------
  const resetSelection = () => {
    selectionGrid.value = {}
    lastSelection.value = null
  }

  // A new sort, a search or a task update hands the list new rows, and the
  // store selection stays: its tasks still listed stay highlighted, and the
  // last row clicked keeps its task.
  const followTasks = (list, previousList) => {
    const lastTask = previousList?.[lastSelection.value]
    const selectedTasks = store.getters.selectedTasks
    selectionGrid.value = {}
    list.forEach(task => {
      if (selectedTasks.has(task.id)) selectionGrid.value[task.id] = true
    })
    const index = list.findIndex(task => task.id === lastTask?.id)
    lastSelection.value = index >= 0 ? index : null
  }

  const addRow = (index, task) => {
    store.dispatch('addSelectedTask', { task })
    emit('task-selected', task)
    selectionGrid.value[task.id] = true
    lastSelection.value = index
  }

  const applySelection = (event, index, task) => {
    const isSelected = selectionGrid.value[task.id]
    const isManySelection = Object.keys(selectionGrid.value).length > 1
    if (!(event.ctrlKey || event.metaKey) && !event.shiftKey) {
      store.dispatch('clearSelectedTasks')
      resetSelection()
    }

    if (!event.shiftKey) {
      // A click on a row of a multi-selection selects it alone, a Ctrl+click
      // unselects it.
      if (isSelected && (!isManySelection || event.ctrlKey || event.metaKey)) {
        store.dispatch('removeSelectedTask', { task })
        delete selectionGrid.value[task.id]
      } else {
        addRow(index, task)
      }
    } else {
      // The range replaces the selection, and addSelectedTasks merges.
      store.dispatch('clearSelectedTasks')
      selectionGrid.value = {}
      const taskIndices =
        lastSelection.value > index
          ? range(index, lastSelection.value)
          : range(lastSelection.value, index)
      const selection = taskIndices.map(i => ({ task: tasks()[i] }))
      selection.forEach(entry => {
        selectionGrid.value[entry.task.id] = true
      })
      store.dispatch('addSelectedTasks', selection)
    }
    onSelect?.(task)
  }

  const onKeyDown = event => {
    const list = tasks()
    if (list.length > 0 && event.altKey) {
      let index = lastSelection.value || 0
      if ([37, 38].includes(event.keyCode)) {
        index = index - 1 < 0 ? list.length - 1 : index - 1
      } else if ([39, 40].includes(event.keyCode)) {
        index = index + 1 >= list.length ? 0 : index + 1
      } else {
        return
      }
      // A field leaves with the selection of its row, and a field removed
      // while focused fires its change once the next row is selected: commit
      // first.
      if (
        event.target.nodeName === 'INPUT' &&
        body.value?.contains(event.target)
      ) {
        event.target.blur()
      }
      // Alt+Arrow selects the row alone, even the row it comes from in a list
      // of one task.
      store.dispatch('clearSelectedTasks')
      resetSelection()
      addRow(index, list[index])
      onSelect?.(list[index])
      pauseEvent(event)
    }
  }

  // Watchers
  // --------------------------------------------------------------------------
  watch(tasks, followTasks)

  watch(nbSelectedTasks, () => {
    if (nbSelectedTasks.value === 0) resetSelection()
  })

  // Lifecycle
  // --------------------------------------------------------------------------
  onMounted(() => {
    window.addEventListener('keydown', onKeyDown, false)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
  })

  return { applySelection, resetSelection, selectionGrid }
}
