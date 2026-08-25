/*
 * Shared task-card helpers for `<script setup>` list components
 * (TodosList, KanbanBoard).
 */
import { computed } from 'vue'
import { useStore } from 'vuex'

import { sortPeople } from '@/lib/sorting'

export const useTaskHelpers = () => {
  const store = useStore()

  const personMap = computed(() => store.getters.personMap)
  const productionMap = computed(() => store.getters.productionMap)
  const taskTypeMap = computed(() => store.getters.taskTypeMap)

  // Task cards link the task type scoped to an episode: tvshow tasks
  // without one fall back to the production's first episode.
  const getTaskType = task => {
    const taskType = { ...taskTypeMap.value.get(task.task_type_id) }
    const production = productionMap.value.get(task.project_id)
    taskType.episode_id = task.episode_id
    if (production?.production_type === 'tvshow' && !task.episode_id) {
      taskType.episode_id = production.first_episode_id
    }
    return taskType
  }

  const getSortedPeople = personIds =>
    sortPeople(personIds.map(id => personMap.value.get(id)).filter(Boolean))

  return { getSortedPeople, getTaskType }
}
