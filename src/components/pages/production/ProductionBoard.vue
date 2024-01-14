<template>
  <div class="production-board">
    <div class="box" v-if="!currentProduction.task_statuses?.length">
      {{ $t('settings.production.empty_list') }}
    </div>
    <table class="datatable" v-else>
      <thead>
        <tr>
          <th class="th-name">{{ $t('task_status.fields.name') }}</th>
          <th class="th-short-name">
            {{ $t('task_status.fields.short_name') }}
          </th>
          <th class="th-roles">
            {{ $t('board.settings.visible') }}
          </th>
        </tr>
      </thead>
      <tbody class="datatable-body">
        <template v-for="taskStatus in sortedProductionTaskStatuses">
          <tr
            class="datatable-row task-status"
            :key="taskStatus.id"
            v-if="taskStatus"
          >
            <td>{{ taskStatus.name }}</td>
            <td class="name">
              <validation-tag
                :is-static="true"
                :task="{ task_status_id: taskStatus.id }"
              />
            </td>
            <td class="role">
              <boolean-field
                class="role-field"
                :key="`${taskStatus.id}-${role}`"
                :label="$t(`people.role.${role}`)"
                :value="String(isActiveRole(taskStatus, role))"
                @click="updateRolesForBoard(taskStatus, role)"
                v-for="role in availableRoles"
              />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { sortTaskStatuses } from '@/lib/sorting'

import BooleanField from '@/components/widgets/BooleanField'
import ValidationTag from '@/components/widgets/ValidationTag'

export default {
  name: 'production-board',

  components: {
    BooleanField,
    ValidationTag
  },

  data() {
    return {
      availableRoles: ['user', 'vendor', 'supervisor', 'manager', 'admin']
    }
  },

  computed: {
    ...mapGetters(['currentProduction', 'productionTaskStatuses']),

    sortedProductionTaskStatuses() {
      return sortTaskStatuses(
        this.productionTaskStatuses,
        this.currentProduction
      )
    }
  },

  methods: {
    ...mapActions(['editTaskStatusLink', 'loadContext']),

    getActiveRoles(taskStatus) {
      return (
        this.currentProduction.task_statuses_link[taskStatus.id]
          ?.roles_for_board || []
      )
    },

    isActiveRole(taskStatus, role) {
      return this.getActiveRoles(taskStatus).includes(role)
    },

    async updateRolesForBoard(taskStatus, role) {
      const roles = this.getActiveRoles(taskStatus)
      if (this.isActiveRole(taskStatus, role)) {
        roles.splice(roles.indexOf(role), 1)
      } else {
        roles.push(role)
      }

      const taskStatusLink = {
        ...this.currentProduction.task_statuses_link[taskStatus.id],
        roles_for_board: roles,
        project_id: this.currentProduction.id,
        task_status_id: taskStatus.id
      }
      await this.editTaskStatusLink(taskStatusLink)
      await this.loadContext()
    }
  }
}
</script>

<style lang="scss" scoped>
.datatable th {
  color: var(--text);
  padding-left: 10px;
  padding-bottom: 5px;
}

.th-name {
  width: 200px;
}

.th-short-name {
  width: 120px;
}

.role {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;

  .role-field {
    margin: 0;
  }
}
</style>
