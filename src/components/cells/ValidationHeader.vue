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

<script setup>
import { ChevronDownIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useStore } from 'vuex'

import DepartmentName from '@/components/widgets/DepartmentName.vue'

const store = useStore()

const props = defineProps({
  columnId: { type: String, default: null },
  hiddenColumns: { type: Object, default: () => ({}) },
  isStick: { type: Boolean, default: false },
  left: { type: String, default: null },
  type: { type: String, default: 'assets' },
  validationStyle: { type: Object, default: () => ({}) }
})

defineEmits(['show-header-menu'])

const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const departmentMap = computed(() => store.getters.departmentMap)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isTVShow = computed(() => store.getters.isTVShow)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const currentTaskType = computed(
  () => taskTypeMap.value.get(props.columnId) ?? {}
)

const currentDepartment = computed(() =>
  departmentMap.value.get(currentTaskType.value.department_id)
)

const isHiddenColumn = computed(() => props.hiddenColumns[props.columnId])

const taskTypePath = taskTypeId => {
  if (currentTaskType.value.for_entity === 'Episode') {
    return {
      name: 'episodes-task-type',
      params: {
        production_id: currentProduction.value.id,
        task_type_id: taskTypeId
      }
    }
  }
  const route = {
    name: 'task-type',
    params: {
      production_id: currentProduction.value.id,
      task_type_id: taskTypeId,
      type: props.type
    }
  }
  if (isTVShow.value && currentEpisode.value) {
    route.name = 'episode-task-type'
    route.params.episode_id = currentEpisode.value.id
  }
  return route
}
</script>

<style lang="scss" scoped>
th.metadata-descriptor {
  min-width: 120px;
  max-width: none;
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
