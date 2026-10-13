// The task selection of the store, which the action panel changes: the
// actions of the tasks module, reduced to their effect on that selection.
export const trackTaskSelection = () => {
  const selected = new Map()
  const actions = {
    addSelectedTask: (context, { task }) => {
      selected.set(task.id, task)
    },
    addSelectedTasks: (context, selection) => {
      selection.forEach(({ task }) => selected.set(task.id, task))
    },
    clearSelectedTasks: () => {
      selected.clear()
    },
    removeSelectedTask: (context, { task }) => {
      selected.delete(task.id)
    }
  }
  return { selected, actions }
}
