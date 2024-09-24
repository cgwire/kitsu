<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable multi-section">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="department">
              {{ $t('task_types.fields.department') }}
            </th>
            <th scope="col" class="name">
              {{ $t('task_types.fields.name') }}
            </th>
            <th scope="col" class="short_name">
              {{ $t('task_types.fields.short_name') }}
            </th>
            <th scope="col" class="allow-timelog">
              {{ $t('task_types.fields.allow_timelog') }}
            </th>
            <th scope="col" class="description">
              {{ $t('task_types.fields.description') }}
            </th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>

        <draggable
          class="datatable-body"
          item-key="id"
          tag="tbody"
          @end="updatePriorityAssets"
          v-model="assetsItems"
        >
          <template #header>
            <tr class="datatable-type-header">
              <th scope="rowgroup" colspan="6">
                <span class="datatable-row-header">
                  {{ $t('assets.title') }}
                </span>
              </th>
            </tr>
          </template>
          <template #item="{ element: taskType }">
            <tr class="datatable-row tasktype-item">
              <td class="department">
                <department-name
                  :department="getDepartment(taskType.department_id)"
                  v-if="!isEmpty(taskType.department_id)"
                />
              </td>
              <task-type-cell class="name" :task-type="taskType" />
              <td class="short_name">
                {{ taskType.short_name }}
              </td>
              <boolean-cell
                class="allow-timelog"
                :value="taskType.allow_timelog"
              />
              <td>
                {{ taskType.description }}
              </td>
              <row-actions-cell
                :task-type-id="taskType.id"
                @delete-clicked="$emit('delete-clicked', taskType)"
                @edit-clicked="$emit('edit-clicked', taskType)"
              />
            </tr>
          </template>
          <template #footer v-if="!assetsItems.length">
            <tr class="empty">
              <th scope="rowgroup" colspan="6">
                <span class="text">
                  {{ $t('task_types.no_task_types') }}
                </span>
              </th>
            </tr>
          </template>
        </draggable>

        <draggable
          class="datatable-body"
          item-key="id"
          tag="tbody"
          @end="updatePriorityShots"
          v-model="shotsItems"
        >
          <template #header>
            <tr class="datatable-type-header">
              <th scope="rowgroup" colspan="6">
                <span class="datatable-row-header">
                  {{ $t('shots.title') }}
                </span>
              </th>
            </tr>
          </template>
          <template #item="{ element: taskType }">
            <tr class="datatable-row tasktype-item">
              <td class="department">
                <department-name
                  :department="getDepartment(taskType.department_id)"
                  v-if="!isEmpty(taskType.department_id)"
                />
              </td>
              <task-type-cell class="name" :task-type="taskType" />
              <td class="short_name">
                {{ taskType.short_name }}
              </td>
              <boolean-cell
                class="allow-timelog"
                :value="taskType.allow_timelog"
              />
              <td>
                {{ taskType.description }}
              </td>
              <row-actions-cell
                :task-type-id="taskType.id"
                @delete-clicked="$emit('delete-clicked', taskType)"
                @edit-clicked="$emit('edit-clicked', taskType)"
              />
            </tr>
          </template>
          <template #footer v-if="!shotsItems.length">
            <tr class="empty">
              <th scope="rowgroup" colspan="6">
                <span class="text">
                  {{ $t('task_types.no_task_types') }}
                </span>
              </th>
            </tr>
          </template>
        </draggable>

        <draggable
          class="datatable-body"
          item-key="id"
          tag="tbody"
          @end="updatePriorityEdits"
          v-model="editsItems"
        >
          <template #header>
            <tr class="datatable-type-header">
              <th scope="rowgroup" colspan="6">
                <span class="datatable-row-header">
                  {{ $t('edits.title') }}
                </span>
              </th>
            </tr>
          </template>
          <template #item="{ element: taskType }">
            <tr class="datatable-row tasktype-item">
              <td class="department">
                <department-name
                  :department="getDepartment(taskType.department_id)"
                  v-if="!isEmpty(taskType.department_id)"
                />
              </td>
              <task-type-cell class="name" :task-type="taskType" />
              <td class="short_name">
                {{ taskType.short_name }}
              </td>
              <boolean-cell
                class="allow-timelog"
                :value="taskType.allow_timelog"
              />
              <td>
                {{ taskType.description }}
              </td>
              <row-actions-cell
                :task-type-id="taskType.id"
                @delete-clicked="$emit('delete-clicked', taskType)"
                @edit-clicked="$emit('edit-clicked', taskType)"
              />
            </tr>
          </template>
          <template #footer v-if="!editsItems.length">
            <tr class="empty">
              <th scope="rowgroup" colspan="6">
                <span class="text">
                  {{ $t('task_types.no_task_types') }}
                </span>
              </th>
            </tr>
          </template>
        </draggable>

        <draggable
          class="datatable-body"
          item-key="id"
          tag="tbody"
          @end="updatePrioritySequences"
          v-model="sequencesItems"
        >
          <template #header>
            <tr class="datatable-type-header">
              <th scope="rowgroup" colspan="6">
                <span class="datatable-row-header">
                  {{ $t('sequences.title') }}
                </span>
              </th>
            </tr>
          </template>
          <template #item="{ element: taskType }">
            <tr class="datatable-row tasktype-item">
              <td class="department">
                <department-name
                  :department="getDepartment(taskType.department_id)"
                  v-if="!isEmpty(taskType.department_id)"
                />
              </td>
              <task-type-cell class="name" :task-type="taskType" />
              <td class="short_name">
                {{ taskType.short_name }}
              </td>
              <boolean-cell
                class="allow-timelog"
                :value="taskType.allow_timelog"
              />
              <td>
                {{ taskType.description }}
              </td>
              <row-actions-cell
                :task-type-id="taskType.id"
                @delete-clicked="$emit('delete-clicked', taskType)"
                @edit-clicked="$emit('edit-clicked', taskType)"
              />
            </tr>
          </template>
          <template #footer v-if="!sequencesItems.length">
            <tr class="empty">
              <th scope="rowgroup" colspan="6">
                <span class="text">
                  {{ $t('task_types.no_task_types') }}
                </span>
              </th>
            </tr>
          </template>
        </draggable>

        <draggable
          class="datatable-body"
          item-key="id"
          tag="tbody"
          @end="updatePriorityEpisodes"
          v-model="episodesItems"
        >
          <template #header>
            <tr class="datatable-type-header">
              <th scope="rowgroup" colspan="6">
                <span class="datatable-row-header">
                  {{ $t('episodes.title') }}
                </span>
              </th>
            </tr>
          </template>
          <template #item="{ element: taskType }">
            <tr class="datatable-row tasktype-item">
              <td class="department">
                <department-name
                  :department="getDepartment(taskType.department_id)"
                  v-if="!isEmpty(taskType.department_id)"
                />
              </td>
              <task-type-cell class="name" :task-type="taskType" />
              <td class="short_name">
                {{ taskType.short_name }}
              </td>
              <boolean-cell
                class="allow-timelog"
                :value="taskType.allow_timelog"
              />
              <td>
                {{ taskType.description }}
              </td>
              <row-actions-cell
                :task-type-id="taskType.id"
                @delete-clicked="$emit('delete-clicked', taskType)"
                @edit-clicked="$emit('edit-clicked', taskType)"
              />
            </tr>
          </template>
          <template #footer v-if="!episodesItems.length">
            <tr class="empty">
              <th scope="rowgroup" colspan="6">
                <span class="text">
                  {{ $t('task_types.no_task_types') }}
                </span>
              </th>
            </tr>
          </template>
        </draggable>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <p class="has-text-centered nb-task-types">
      {{ entries.length }} {{ $tc('task_types.number', entries.length) }}
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'

import BooleanCell from '@/components/cells/BooleanCell.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'

export default {
  name: 'task-type-list',

  components: {
    draggable,
    BooleanCell,
    DepartmentName,
    RowActionsCell,
    TableInfo,
    TaskTypeCell
  },

  props: {
    entries: {
      type: Array,
      default: () => []
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['delete-clicked', 'edit-clicked', 'update-priorities'],

  data() {
    return {
      assetsItems: [],
      shotsItems: [],
      editsItems: [],
      sequencesItems: [],
      episodesItems: []
    }
  },

  computed: {
    ...mapGetters(['getDepartment']),

    assetTaskTypes() {
      return this.getTaskTypesForEntity('Asset')
    },

    shotTaskTypes() {
      return this.getTaskTypesForEntity('Shot')
    },

    editTaskTypes() {
      return this.getTaskTypesForEntity('Edit')
    },

    sequenceTaskTypes() {
      return this.getTaskTypesForEntity('Sequence')
    },

    episodeTaskTypes() {
      return this.getTaskTypesForEntity('Episode')
    }
  },

  methods: {
    getTaskTypesForEntity(entity) {
      return this.entries.filter(taskType => taskType.for_entity === entity)
    },

    updatePriority(items) {
      const forms = []
      items.forEach((item, index) => {
        index += 1
        const form = {
          id: item.id,
          name: item.name,
          priority: String(index)
        }
        item.priority = index
        forms.push(form)
      })
      this.$emit('update-priorities', forms)
    },

    updatePriorityAssets() {
      this.updatePriority(this.assetsItems)
    },

    updatePriorityShots() {
      this.updatePriority(this.shotsItems)
    },

    updatePriorityEdits() {
      this.updatePriority(this.editsItems)
    },

    updatePrioritySequences() {
      this.updatePriority(this.sequencesItems)
    },

    updatePriorityEpisodes() {
      this.updatePriority(this.episodesItems)
    },

    isEmpty(value) {
      return value === undefined || value === null || value === ''
    }
  },

  watch: {
    entries: {
      deep: true,
      immediate: true,
      handler() {
        this.assetsItems = JSON.parse(JSON.stringify(this.assetTaskTypes))
        this.shotsItems = JSON.parse(JSON.stringify(this.shotTaskTypes))
        this.editsItems = JSON.parse(JSON.stringify(this.editTaskTypes))
        this.sequencesItems = JSON.parse(JSON.stringify(this.sequenceTaskTypes))
        this.episodesItems = JSON.parse(JSON.stringify(this.episodeTaskTypes))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.department {
  width: 200px;
  min-width: 200px;
}

.name {
  width: 300px;
  min-width: 300px;
}

.short_name {
  width: 200px;
  min-width: 200px;
}

.priority {
  width: 80px;
  min-width: 80px;
}

.allow-timelog {
  width: 100px;
  min-width: 100px;
  text-align: center;
}

.actions {
  min-width: 100px;
}

.color {
  width: 100px;
}

.tasktype-item {
  cursor: grab;
}

.tasktype-item[draggable='true'] {
  cursor: grabbing;
}

.empty {
  span {
    color: var(--text);
    font-weight: normal;
    font-style: italic;
  }
}

.data-list {
  margin-top: 0;
}
</style>
