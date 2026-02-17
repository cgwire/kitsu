<template>
  <th
    scope="col"
    :class="{
      'validation-cell': !isHiddenColumn,
      'hidden-validation-cell': isHiddenColumn,
      'datatable-row-header': isStick
    }"
    :style="{ left }"
  >
    <div class="flexrow validation-content" :style="validationStyle">
      <department-name
        class="department-dot"
        :department="currentDepartment"
        no-padding
        only-dot
        v-if="currentDepartment"
      />
      <router-link
        class="flexrow-item datatable-dropdown ellipsis task-type-name"
        :title="!isHiddenColumn ? currentTaskType.name : null"
        :to="taskTypePath(columnId)"
        v-if="!isCurrentUserClient"
      >
        {{ !isHiddenColumn ? currentTaskType.name : '' }}
      </router-link>
      <span
        class="flexrow-item datatable-dropdown ellipsis task-type-name"
        :title="!isHiddenColumn ? currentTaskType.name : null"
        v-else
      >
        {{ !isHiddenColumn ? currentTaskType.name : '' }}
      </span>
      <span
        class="metadata-menu-button header-icon pointer"
        @click="$emit('show-header-menu', $event)"
      >
        <chevron-down-icon :size="14" />
      </span>
    </div>
  </th>
</template>

<script>
import { mapGetters } from 'vuex'
import { ChevronDownIcon } from 'lucide-vue-next'

import DepartmentName from '@/components/widgets/DepartmentName.vue'

export default {
  name: 'validation-header',

  components: {
    ChevronDownIcon,
    DepartmentName
  },

  props: {
    hiddenColumns: Object,
    columnId: String,
    validationStyle: Object,
    isStick: {
      type: Boolean,
      default: false
    },
    left: {
      type: String
    },
    type: {
      type: String,
      default: 'assets'
    }
  },

  emits: ['show-header-menu'],

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'isCurrentUserClient',
      'isTVShow',
      'departmentMap',
      'taskTypeMap'
    ]),

    currentDepartment() {
      return this.departmentMap.get(this.currentTaskType.department_id)
    },

    currentTaskType() {
      return this.taskTypeMap.get(this.columnId) ?? {}
    },

    isHiddenColumn() {
      return this.hiddenColumns[this.columnId]
    }
  },
  methods: {
    taskTypePath(taskTypeId) {
      if (this.currentTaskType.for_entity === 'Episode') {
        const route = {
          name: 'episodes-task-type',
          params: {
            production_id: this.currentProduction.id,
            task_type_id: taskTypeId
          }
        }
        return route
      } else {
        const route = {
          name: 'task-type',
          params: {
            production_id: this.currentProduction.id,
            task_type_id: taskTypeId,
            type: this.type
          }
        }

        if (this.isTVShow && this.currentEpisode) {
          route.name = 'episode-task-type'
          route.params.episode_id = this.currentEpisode.id
        }
        return route
      }
    }
  }
}
</script>

<style lang="scss" scoped>
th.metadata-descriptor {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  overflow-wrap: break-word;
  hyphens: auto;
}

.task-type-name {
  font-size: 1.1em;
  max-width: 95%;
  text-transform: none;
  margin-right: 0;
}

.metadata-menu-button {
  background: var(--background);
  border-radius: 50%;
  height: 16px;
  width: 16px;
  padding: 1px;
  position: absolute;
  right: 5px;
}
</style>
