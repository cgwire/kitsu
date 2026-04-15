<template>
  <board-settings
    :task-statuses="sortedProductionTaskStatuses"
    :roles-map="rolesMap"
    @update-roles="onUpdateRoles"
  />
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { sortTaskStatuses } from '@/lib/sorting'

import BoardSettings from '@/components/pages/production/BoardSettings.vue'

export default {
  name: 'production-board',

  components: {
    BoardSettings
  },

  computed: {
    ...mapGetters(['currentProduction', 'productionTaskStatuses']),

    sortedProductionTaskStatuses() {
      return sortTaskStatuses(
        [...this.productionTaskStatuses],
        this.currentProduction
      )
    },

    rolesMap() {
      const map = {}
      const links = this.currentProduction.task_statuses_link || {}
      this.productionTaskStatuses.forEach(ts => {
        map[ts.id] = links[ts.id]?.roles_for_board || []
      })
      return map
    }
  },

  methods: {
    ...mapActions(['editTaskStatusLink', 'loadContext']),

    async onUpdateRoles({ taskStatusId, roles }) {
      const taskStatusLink = {
        ...this.currentProduction.task_statuses_link[taskStatusId],
        roles_for_board: roles,
        project_id: this.currentProduction.id,
        task_status_id: taskStatusId
      }
      await this.editTaskStatusLink(taskStatusLink)
      await this.loadContext()
    }
  }
}
</script>
