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
            <td class="roles">
              <boolean-field
                class="role-field"
                :key="`${taskStatus.id}-${role}`"
                :label="$t(`people.role.${role}`)"
                :model-value="String(isActiveRole(taskStatus, role))"
                @click="
                  value =>
                    updateRolesForBoard(taskStatus, [role], value === 'true')
                "
                v-for="role in availableRoles"
              />
              <button
                class="button"
                @click="updateRolesForBoard(taskStatus, availableRoles)"
                v-if="getActiveRoles(taskStatus).length < availableRoles.length"
              >
                {{ $t('board.settings.select_all') }}
              </button>
              <button
                class="button"
                @click="updateRolesForBoard(taskStatus, availableRoles, false)"
                v-else
              >
                {{ $t('board.settings.unselect_all') }}
              </button>
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

import BooleanField from '@/components/widgets/BooleanField.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

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
        [...this.productionTaskStatuses],
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

    async updateRolesForBoard(taskStatus, rolesToUpdate, addition = true) {
      const roles = [...this.getActiveRoles(taskStatus)]

      rolesToUpdate.forEach(role => {
        if (addition && !this.isActiveRole(taskStatus, role)) {
          roles.push(role)
        } else if (!addition && this.isActiveRole(taskStatus, role)) {
          roles.splice(roles.indexOf(role), 1)
        }
      })

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

.roles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  align-items: center;

  .role-field {
    margin: 0;
  }

  .button {
    border: 2px dashed transparent;
    border-radius: 25px;
    color: $grey;
    background: none;
    font-size: 0.9em;
    font-weight: 500;
    height: 100%;
    padding: 0.5em 1.2em;
    transition: 0.3s ease all;

    &:hover {
      color: $light-green;
      border-color: $light-green;
    }
  }
}
</style>
