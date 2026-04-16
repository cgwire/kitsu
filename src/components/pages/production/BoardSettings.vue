<template>
  <div class="board-settings">
    <div class="box" v-if="!taskStatuses?.length">
      {{ $t('settings.production.empty_board') }}
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
        <template v-for="taskStatus in taskStatuses">
          <tr
            class="datatable-row task-status"
            :key="taskStatus.id"
            v-if="taskStatus"
          >
            <td class="name-full">{{ taskStatus.name }}</td>
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
                :model-value="String(isActiveRole(taskStatus.id, role))"
                @click="
                  value => onToggleRole(taskStatus.id, role, value === 'true')
                "
                v-for="role in availableRoles"
              />
              <button
                class="button"
                @click="onSelectAll(taskStatus.id)"
                v-if="
                  getActiveRoles(taskStatus.id).length < availableRoles.length
                "
              >
                {{ $t('board.settings.select_all') }}
              </button>
              <button
                class="button"
                @click="onUnselectAll(taskStatus.id)"
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

<script setup>
import BooleanField from '@/components/widgets/BooleanField.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

const props = defineProps({
  taskStatuses: { type: Array, default: () => [] },
  rolesMap: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update-roles'])

const availableRoles = ['user', 'vendor', 'supervisor', 'manager', 'admin']

const getActiveRoles = taskStatusId => {
  return props.rolesMap[taskStatusId] || []
}

const isActiveRole = (taskStatusId, role) => {
  return getActiveRoles(taskStatusId).includes(role)
}

const onToggleRole = (taskStatusId, role, active) => {
  const roles = [...getActiveRoles(taskStatusId)]
  if (active && !roles.includes(role)) {
    roles.push(role)
  } else if (!active) {
    const idx = roles.indexOf(role)
    if (idx >= 0) roles.splice(idx, 1)
  }
  emit('update-roles', { taskStatusId, roles })
}

const onSelectAll = taskStatusId => {
  emit('update-roles', { taskStatusId, roles: [...availableRoles] })
}

const onUnselectAll = taskStatusId => {
  emit('update-roles', { taskStatusId, roles: [] })
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
