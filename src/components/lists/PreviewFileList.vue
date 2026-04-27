<template>
  <div class="data-list">
    <div style="overflow: hidden">
      <table class="datatable" ref="headerWrapper">
        <thead class="datatable-head">
          <tr class="datatable-row-header">
            <th class="date">
              {{ $t('logs.preview_files.date') }}
            </th>
            <th class="production">
              {{ $t('logs.preview_files.production') }}
            </th>
            <th class="entity-name">
              {{ $t('logs.preview_files.entity_name') }}
            </th>
            <th class="task-type">
              {{ $t('logs.preview_files.task_type_id') }}
            </th>
            <th class="revision">
              {{ $t('logs.preview_files.revision') }}
            </th>
            <th class="status">
              {{ $t('logs.preview_files.status') }}
            </th>
            <th class="end-cell"></th>
          </tr>
        </thead>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <div @scroll.passive="onBodyScroll" v-if="previewFiles.length > 0">
      <table class="datatable">
        <tbody class="datatable-body">
          <tr
            :key="previewFile.id"
            class="datatable-row"
            @click="redirectToTask(previewFile)"
            v-for="previewFile in previewFiles"
          >
            <td class="date">
              {{ formatDate(previewFile.created_at) }}
            </td>
            <td class="production">
              <production-name-cell
                :entry="productionMap.get(previewFile.project_id)"
              />
            </td>
            <td class="entity-name">
              {{ previewFile.full_entity_name }}
            </td>
            <task-type-cell
              class="task-type"
              :task-type="taskTypeMap.get(previewFile.task_type_id)"
            />
            <td class="revision">
              {{ previewFile.revision }}
            </td>
            <td class="status" :data-status="previewFile.status">
              {{ previewFile.status }}
            </td>
            <td class="end-cell has-text-right">
              <button-simple
                class="mark-broken-button"
                :text="$t('logs.preview_files.mark_broken')"
                @click.stop="$emit('mark-broken-clicked', previewFile.id)"
                v-if="previewFile.status === 'processing'"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { getTaskPath } from '@/lib/path'
import { formatDate } from '@/lib/time'

import ProductionNameCell from '@/components/cells/ProductionNameCell.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const router = useRouter()
const store = useStore()

// Props / Emits

defineProps({
  previewFiles: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  isError: { type: Boolean, default: false }
})

defineEmits(['mark-broken-clicked'])

// State

const headerWrapper = ref(null)

// Computed

const productionMap = computed(() => store.getters.productionMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

// Functions

const onBodyScroll = event => {
  headerWrapper.value.style.left = `-${event.target.scrollLeft}px`
}

const redirectToTask = async previewFile => {
  const task = await store.dispatch('loadTask', { taskId: previewFile.task_id })
  return router.push(
    getTaskPath(
      task,
      task.project,
      task.project.production_type === 'tvshow',
      task.episode,
      taskTypeMap.value
    )
  )
}
</script>

<style lang="scss" scoped>
.datatable-head th {
  border: 0;
}

.date {
  max-width: 150px;
  width: 150px;
}

.entity-name {
  max-width: 300px;
  width: 300px;
  word-break: break-word;
}

.production {
  max-width: 300px;
  width: 300px;
}

.revision {
  max-width: 80px;
  width: 80px;
}

.task-type {
  max-width: 200px;
  overflow: auto hidden;
  width: 200px;
}

td.status {
  font-weight: 500;
  text-transform: uppercase;

  &[data-status='broken'] {
    color: red;
  }
}

tr {
  cursor: pointer;
}

tr:first-child {
  td:first-child {
    border-top-left-radius: 10px;
  }

  td:last-child {
    border-top-right-radius: 10px;
  }
}

tr:last-child {
  td:first-child {
    border-bottom-left-radius: 10px;
  }

  td:last-child {
    border-bottom-right-radius: 10px;
  }
}
</style>
