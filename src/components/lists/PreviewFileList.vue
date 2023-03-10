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

    <div v-scroll="onBodyScroll" v-if="previewFiles.length > 0">
      <table class="datatable">
        <tbody class="datatable-body">
          <tr
            :key="previewFile.id"
            class="datatable-row"
            @click="event => redirectToTask(event, previewFile)"
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
            <task-type-name
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
                text="Mark as broken"
                @click="$emit('mark-broken-clicked', previewFile.id)"
                v-if="previewFile.status === 'processing'"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { formatListMixin } from '@/components/mixins/format'
import { getTaskPath } from '@/lib/path'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import TableInfo from '@/components/widgets/TableInfo'
import ProductionNameCell from '@/components/cells/ProductionNameCell'
import TaskTypeName from '@/components/cells/TaskTypeName'

export default {
  name: 'entity-task-list',
  mixins: [formatListMixin],

  components: {
    ButtonSimple,
    ProductionNameCell,
    TableInfo,
    TaskTypeName
  },

  props: {
    previewFiles: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      currentTask: null
    }
  },

  computed: {
    ...mapGetters(['personMap', 'productionMap', 'taskTypeMap'])
  },

  methods: {
    ...mapActions(['loadTask', 'markBroken']),

    onBodyScroll(event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    },

    async redirectToTask(event, previewFile) {
      if (
        event.target.parentNode.className === 'mark-broken-button button' ||
        event.target.className === 'mark-broken-button button'
      )
        return
      const task = await this.loadTask({ taskId: previewFile.task_id })
      return this.$router.push(
        getTaskPath(
          task,
          task.project,
          task.project.production_type === 'tvshow',
          task.episode,
          this.taskTypeMap
        )
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.date {
  max-width: 150px;
  width: 150px;
}

.production {
  max-width: 300px;
  width: 300px;
}

.entity-name {
  max-width: 300px;
  width: 300px;
}

.task-type {
  max-width: 150px;
  width: 150px;
}

.revision {
  max-width: 80px;
  width: 80px;
}

.status {
}

.avatar-wrapper {
  margin-right: 0.5em;
}

.datatable-head {
  th {
    border: 0;
  }
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

tr {
  cursor: pointer;
}

td.status {
  text-transform: uppercase;
  font-weight: 500;
}

td.status[data-status='broken'] {
  color: red;
}

td.status[data-status='processing'] {
}
</style>
