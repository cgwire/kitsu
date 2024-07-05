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
          draggable=".tasktype-item"
          :sort="true"
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
          <tr
            class="datatable-row tasktype-item"
            :key="taskType.id"
            v-for="taskType in assetsItems"
          >
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
            <td class="allow-timelog">
              <boolean-rep :value="taskType.allow_timelog" />
            </td>
            <td>
              {{ taskType.description }}
            </td>
            <row-actions-cell
              :taskType-id="taskType.id"
              @delete-clicked="$emit('delete-clicked', taskType)"
              @edit-clicked="$emit('edit-clicked', taskType)"
            />
          </tr>
          <tr class="empty" v-if="assetsItems.length === 0">
            <th scope="rowgroup" colspan="6">
              <span class="text">
                {{ $t('task_types.no_task_types') }}
              </span>
            </th>
          </tr>
        </draggable>

        <draggable
          class="datatable-body"
          v-model="shotsItems"
          draggable=".tasktype-item"
          tag="tbody"
          :sort="true"
          @end="updatePriorityShots"
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
          <tr
            class="datatable-row tasktype-item"
            v-for="taskType in shotsItems"
            :key="taskType.id"
          >
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
            <td class="allow-timelog">
              <boolean-rep :value="taskType.allow_timelog" />
            </td>
            <td>
              {{ taskType.description }}
            </td>
            <row-actions-cell
              :taskType-id="taskType.id"
              @delete-clicked="$emit('delete-clicked', taskType)"
              @edit-clicked="$emit('edit-clicked', taskType)"
            />
          </tr>
          <tr class="empty" v-if="shotsItems.length === 0">
            <th scope="rowgroup" colspan="6">
              <span class="text">
                {{ $t('task_types.no_task_types') }}
              </span>
            </th>
          </tr>
        </draggable>

        <draggable
          class="datatable-body"
          v-model="editsItems"
          draggable=".tasktype-item"
          tag="tbody"
          :sort="true"
          @end="updatePriorityEdits"
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
          <tr
            class="datatable-row tasktype-item"
            v-for="taskType in editsItems"
            :key="taskType.id"
          >
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
            <td class="allow-timelog">
              <boolean-rep :value="taskType.allow_timelog" />
            </td>
            <td>
              {{ taskType.description }}
            </td>
            <row-actions-cell
              :taskType-id="taskType.id"
              @delete-clicked="$emit('delete-clicked', taskType)"
              @edit-clicked="$emit('edit-clicked', taskType)"
            />
          </tr>
          <tr class="empty" v-if="editsItems.length === 0">
            <th scope="rowgroup" colspan="6">
              <span class="text">
                {{ $t('task_types.no_task_types') }}
              </span>
            </th>
          </tr>
        </draggable>

        <draggable
          class="datatable-body"
          v-model="sequencesItems"
          draggable=".tasktype-item"
          tag="tbody"
          :sort="true"
          @end="updatePrioritySequences"
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
          <tr
            class="datatable-row tasktype-item"
            v-for="taskType in sequencesItems"
            :key="taskType.id"
          >
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
            <td class="allow-timelog">
              <boolean-rep :value="taskType.allow_timelog" />
            </td>
            <td>
              {{ taskType.description }}
            </td>
            <row-actions-cell
              :taskType-id="taskType.id"
              @delete-clicked="$emit('delete-clicked', taskType)"
              @edit-clicked="$emit('edit-clicked', taskType)"
            />
          </tr>
          <tr class="empty" v-if="sequencesItems.length === 0">
            <th scope="rowgroup" colspan="6">
              <span class="text">
                {{ $t('task_types.no_task_types') }}
              </span>
            </th>
          </tr>
        </draggable>

        <draggable
          class="datatable-body"
          v-model="episodesItems"
          draggable=".tasktype-item"
          tag="tbody"
          :sort="true"
          @end="updatePriorityEpisodes"
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
          <tr
            class="datatable-row tasktype-item"
            v-for="taskType in episodesItems"
            :key="taskType.id"
          >
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
            <td class="allow-timelog">
              <boolean-rep :value="taskType.allow_timelog" />
            </td>
            <td>
              {{ taskType.description }}
            </td>
            <row-actions-cell
              :taskType-id="taskType.id"
              @delete-clicked="$emit('delete-clicked', taskType)"
              @edit-clicked="$emit('edit-clicked', taskType)"
            />
          </tr>
        </draggable>
        <tr class="empty" v-if="episodesItems.length === 0">
          <th scope="rowgroup" colspan="6">
            <span class="text">
              {{ $t('task_types.no_task_types') }}
            </span>
          </th>
        </tr>
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

import BooleanRep from '@/components/widgets/BooleanRep.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'

export default {
  name: 'task-type-list',

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

  data() {
    return {
      assetsItems: [],
      shotsItems: [],
      editsItems: [],
      sequencesItems: [],
      episodesItems: []
    }
  },

  components: {
    draggable,
    BooleanRep,
    DepartmentName,
    RowActionsCell,
    TableInfo,
    TaskTypeCell
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
      immediate: true,
      handler() {
        setTimeout(() => {
          this.assetsItems = JSON.parse(JSON.stringify(this.assetTaskTypes))
          this.shotsItems = JSON.parse(JSON.stringify(this.shotTaskTypes))
          this.editsItems = JSON.parse(JSON.stringify(this.editTaskTypes))
          this.episodesItems = JSON.parse(JSON.stringify(this.episodeTaskTypes))
          this.sequencesItems = JSON.parse(
            JSON.stringify(this.sequenceTaskTypes)
          )
        }, 100)
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

.dedicated {
  width: 100px;
  min-width: 100px;
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
