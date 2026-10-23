<template>
  <div>
    <p class="explanation mb1">{{ $t('board.settings.description') }}</p>
    <board-settings
      :task-statuses="sortedProductionTaskStatuses"
      :roles-map="rolesMap"
      @update-roles="onUpdateRoles"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { sortTaskStatuses } from '@/lib/sorting'

import BoardSettings from '@/components/pages/production/BoardSettings.vue'

const store = useStore()

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const productionTaskStatuses = computed(
  () => store.getters.productionTaskStatuses
)

const sortedProductionTaskStatuses = computed(() =>
  sortTaskStatuses([...productionTaskStatuses.value], currentProduction.value)
)

const rolesMap = computed(() => {
  const links = currentProduction.value.task_statuses_link || {}
  return Object.fromEntries(
    productionTaskStatuses.value.map(ts => [
      ts.id,
      links[ts.id]?.roles_for_board || []
    ])
  )
})

// Functions
// --------------------------------------------------------------------------
const onUpdateRoles = async ({ taskStatusId, roles }) => {
  const taskStatusLink = {
    ...currentProduction.value.task_statuses_link?.[taskStatusId],
    roles_for_board: roles,
    project_id: currentProduction.value.id,
    task_status_id: taskStatusId
  }
  await store.dispatch('editTaskStatusLink', taskStatusLink)
  await store.dispatch('loadContext')
}
</script>
