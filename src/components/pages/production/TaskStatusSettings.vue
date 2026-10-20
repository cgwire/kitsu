<template>
  <div class="task-status-settings">
    <div
      class="flexrow mt1 mb1 add-task-status"
      v-if="remainingTaskStatuses.length"
    >
      <combobox-status
        class="flexrow-item selector"
        :task-status-list="remainingTaskStatuses"
        v-model="taskStatusToAdd"
      />
      <button class="button flexrow-item" @click="onAdd">
        {{ $t('main.add') }}
      </button>
    </div>
    <div class="box" v-if="taskStatuses.length === 0">
      {{ $t('settings.production.empty_list') }}
    </div>
    <table class="datatable" v-else>
      <thead>
        <tr>
          <th class="th-grab"></th>
          <th class="th-name">{{ $t('task_status.fields.name') }}</th>
          <th class="th-short-name">
            {{ $t('task_status.fields.short_name') }}
          </th>
          <th class="th-bool">{{ $t('task_status.fields.is_done') }}</th>
          <th class="th-bool">{{ $t('task_status.fields.is_retake') }}</th>
          <th class="th-bool">
            {{ $t('task_status.fields.is_artist_allowed') }}
          </th>
          <th class="th-bool">
            {{ $t('task_status.fields.is_client_allowed') }}
          </th>
          <th></th>
        </tr>
      </thead>
      <!-- A held button must not arm a drag: a reload that shifted the rows
           before the release made vuedraggable throw on the move. -->
      <draggable
        class="datatable-body"
        filter="button"
        item-key="id"
        :prevent-on-filter="false"
        tag="tbody"
        v-model="draggableList"
        @choose="onRowHeld"
        @end="onReorder"
        @start="onRowDragged"
        @unchoose="onRowReleased"
      >
        <template #item="{ element: taskStatus }">
          <tr class="datatable-row task-status">
            <td class="grab">
              <grip-vertical-icon />
            </td>
            <td class="name-full">
              {{ taskStatus.name }}
            </td>
            <td class="name">
              <validation-tag
                :is-static="true"
                :task="{ task_status_id: taskStatus.id }"
              />
            </td>
            <td class="bool-cell has-text-centered">
              <span class="bool-label">
                {{ $t('task_status.fields.is_done') }}
              </span>
              <boolean-rep :value="taskStatus.is_done" />
            </td>
            <td class="bool-cell has-text-centered">
              <span class="bool-label">
                {{ $t('task_status.fields.is_retake') }}
              </span>
              <boolean-rep :value="taskStatus.is_retake" />
            </td>
            <td class="bool-cell has-text-centered">
              <span class="bool-label">
                {{ $t('task_status.fields.is_artist_allowed') }}
              </span>
              <boolean-rep :value="taskStatus.is_artist_allowed" />
            </td>
            <td class="bool-cell has-text-centered">
              <span class="bool-label">
                {{ $t('task_status.fields.is_client_allowed') }}
              </span>
              <boolean-rep :value="taskStatus.is_client_allowed" />
            </td>
            <td class="remove">
              <button class="button" @click="$emit('remove', taskStatus.id)">
                {{ $t('main.remove') }}
              </button>
            </td>
          </tr>
        </template>
      </draggable>
    </table>
  </div>
</template>

<script setup>
import { GripVerticalIcon } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'

import { useDraggableRebuild } from '@/composables/draggableRebuild'
import { sortByName } from '@/lib/sorting'

import BooleanRep from '@/components/widgets/BooleanRep.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  taskStatuses: { type: Array, default: () => [] },
  allTaskStatuses: { type: Array, default: () => [] }
})

const emit = defineEmits(['add', 'remove', 'reorder'])

// State
// --------------------------------------------------------------------------
const taskStatusToAdd = ref(null)
const draggableList = ref([])

// Computed
// --------------------------------------------------------------------------
const linkedIds = computed(() => new Set(props.taskStatuses.map(s => s.id)))

const remainingTaskStatuses = computed(() =>
  sortByName(
    props.allTaskStatuses.filter(
      s => !linkedIds.value.has(s.id) && !s.for_concept
    )
  )
)

// Functions
// --------------------------------------------------------------------------
const resetSelection = () => {
  taskStatusToAdd.value = remainingTaskStatuses.value[0]?.id || null
}

const {
  rebuild: resetDraggableList,
  onRowHeld,
  onRowDragged,
  onRowReleased
} = useDraggableRebuild(() => {
  draggableList.value = [...props.taskStatuses]
})

const onAdd = () => {
  if (!taskStatusToAdd.value) return
  emit('add', taskStatusToAdd.value)
  resetSelection()
}

// The list held during the drag may still show a status removed meanwhile,
// and Zou links again a status a template reorder names.
const onReorder = () => {
  emit(
    'reorder',
    draggableList.value
      .filter(ts => linkedIds.value.has(ts.id))
      .map((ts, index) => ({
        taskStatusId: ts.id,
        priority: index + 1
      }))
  )
}

// Watchers
// --------------------------------------------------------------------------
watch(() => props.taskStatuses, resetDraggableList, { immediate: true })

watch(remainingTaskStatuses, resetSelection, { immediate: true })
</script>

<style lang="scss" scoped>
.datatable th {
  color: var(--text);
  padding-left: 10px;
  padding-bottom: 5px;
}

.th-grab {
  width: 40px;
}

.th-name {
  width: 200px;
}

.th-short-name {
  width: 120px;
}

.th-bool {
  width: 140px;
}

.box {
  max-width: 400px;
}

.task-status {
  cursor: grab;
}

.task-status[draggable='true'] {
  cursor: grabbing;
}

.grab {
  cursor: grab;
  padding-top: 1em;
  width: 40px;
  color: $grey;
}

.field {
  margin-bottom: 0;
}

.bool-label {
  display: none;
}

@media screen and (max-width: 768px) {
  .bool-cell {
    display: flex !important;
    align-items: center;
    gap: 0.5em;
    flex: 1 1 100% !important;
    width: 100% !important;
    text-align: left !important;
  }

  .bool-label {
    display: inline;
    color: var(--text-alt);
    font-size: 0.9em;
  }
}
</style>
