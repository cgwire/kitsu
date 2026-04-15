<template>
  <div class="production-settings fixed-page">
    <div class="wrapper">
      <div class="tabs">
        <ul>
          <li :class="{ 'is-active': isActiveTab('parameters') }">
            <a @click="activeTab = 'parameters'">
              {{ $t('productions.parameters.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('brief') }">
            <a @click="activeTab = 'brief'">
              {{ $t('productions.brief.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('taskStatus') }">
            <a @click="activeTab = 'taskStatus'">
              {{ $t('task_status.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('board') }">
            <a @click="activeTab = 'board'">
              {{ $t('board.settings.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('taskTypes') }">
            <a @click="activeTab = 'taskTypes'">
              {{ $t('task_types.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('assetTypes') }">
            <a @click="activeTab = 'assetTypes'">
              {{ $t('asset_types.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('statusAutomations') }">
            <a @click="activeTab = 'statusAutomations'">
              {{ $t('status_automations.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('backgrounds') }">
            <a @click="activeTab = 'backgrounds'">
              {{ $t('backgrounds.title') }}
            </a>
          </li>
        </ul>
      </div>

      <div class="tab" v-show="isActiveTab('parameters')">
        <production-parameters />
      </div>

      <div class="tab" v-show="isActiveTab('brief')">
        <production-brief />
      </div>

      <div class="tab" v-show="isActiveTab('assetTypes')">
        <asset-type-settings
          :asset-types="productionAssetTypes"
          :all-asset-types="assetTypes"
          @add="addAssetType"
          @remove="removeAssetType"
        />
      </div>

      <div class="tab" v-show="isActiveTab('taskTypes')">
        <production-task-types />
      </div>

      <div class="tab" v-show="isActiveTab('taskStatus')">
        <div
          class="flexrow mt1 mb1 add-task-status"
          v-if="!isEmpty(remainingTaskStatuses)"
        >
          <combobox-status
            class="flexrow-item selector"
            :task-status-list="remainingTaskStatuses"
            v-model="taskStatusId"
          />
          <button class="button flexrow-item" @click="addTaskStatus">
            {{ $t('main.add') }}
          </button>
        </div>
        <div class="box" v-if="isEmpty(currentProduction.task_statuses)">
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
            </tr>
          </thead>
          <draggable
            class="datatable-body"
            item-key="id"
            tag="tbody"
            v-model="taskStatusItems"
            @end="updateTaskStatusPriority"
          >
            <template #item="{ element: taskStatus }">
              <tr class="datatable-row task-status">
                <td class="grab">
                  <grip-vertical-icon />
                </td>
                <td>
                  {{ taskStatus.name }}
                </td>
                <td class="name">
                  <validation-tag
                    :is-static="true"
                    :task="{ task_status_id: taskStatus.id }"
                  />
                </td>
                <boolean-cell :value="taskStatus.is_done" />
                <boolean-cell :value="taskStatus.is_retake" />
                <boolean-cell :value="taskStatus.is_artist_allowed" />
                <boolean-cell :value="taskStatus.is_client_allowed" />
                <td>
                  <button
                    class="button"
                    @click="removeTaskStatus(taskStatus.id)"
                  >
                    {{ $t('main.remove') }}
                  </button>
                </td>
              </tr>
            </template>
          </draggable>
        </table>
      </div>

      <div class="tab" v-show="isActiveTab('board')">
        <production-board />
      </div>

      <div class="tab" v-show="isActiveTab('statusAutomations')">
        <production-status-automations />
      </div>

      <div class="tab" v-show="isActiveTab('backgrounds')">
        <production-backgrounds />
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { mapGetters, mapActions } from 'vuex'

import { sortTaskStatuses } from '@/lib/sorting'

import { GripVerticalIcon } from 'lucide-vue-next'

import AssetTypeSettings from '@/components/pages/production/AssetTypeSettings.vue'
import BooleanCell from '@/components/cells/BooleanCell.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ProductionBackgrounds from '@/components/pages/production/ProductionBackgrounds.vue'
import ProductionBoard from '@/components/pages/production/ProductionBoard.vue'
import ProductionBrief from '@/components/pages/production/ProductionBrief.vue'
import ProductionParameters from '@/components/pages/production/ProductionParameters.vue'
import ProductionStatusAutomations from '@/components/pages/production/ProductionStatusAutomations.vue'
import ProductionTaskTypes from '@/components/pages/production/ProductionTaskTypes.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

export default {
  name: 'production-settings',

  components: {
    AssetTypeSettings,
    BooleanCell,
    ComboboxStatus,
    draggable,
    GripVerticalIcon,
    ProductionBackgrounds,
    ProductionBoard,
    ProductionBrief,
    ProductionParameters,
    ProductionStatusAutomations,
    ProductionTaskTypes,
    ValidationTag
  },

  data() {
    return {
      activeTab: 'parameters',
      taskStatusItems: [],
      taskStatusId: ''
    }
  },

  mounted() {
    if (!this.isCurrentUserManager) {
      this.$router.push({ name: 'not-found' })
      return
    }

    if (this.remainingTaskStatuses.length > 0) {
      this.taskStatusId = this.remainingTaskStatuses[0].id
    }
    if (this.$route.query.tab) {
      this.activeTab = this.$route.query.tab
    }
  },

  computed: {
    ...mapGetters([
      'assetTypes',
      'currentProduction',
      'isCurrentUserManager',
      'productionAssetTypes',
      'productionTaskStatuses',
      'taskStatus'
    ]),

    remainingTaskStatuses() {
      return this.taskStatus.filter(
        status =>
          !this.currentProduction.task_statuses.includes(status.id) &&
          !status.for_concept
      )
    },

    sortedProductionTaskStatuses() {
      return sortTaskStatuses(
        this.productionTaskStatuses,
        this.currentProduction
      )
    }
  },

  methods: {
    ...mapActions([
      'addAssetTypeToProduction',
      'addTaskStatusToProduction',
      'editTaskStatusLink',
      'loadContext',
      'removeAssetTypeFromProduction',
      'removeTaskStatusFromProduction'
    ]),

    isEmpty(list) {
      return !list || list.length === 0
    },

    isActiveTab(tab) {
      return this.activeTab === tab
    },

    addAssetType(assetTypeId) {
      this.addAssetTypeToProduction(assetTypeId)
    },

    removeAssetType(assetTypeId) {
      this.removeAssetTypeFromProduction(assetTypeId)
    },

    async addTaskStatus() {
      await this.addTaskStatusToProduction(this.taskStatusId)
      await this.loadContext()
      this.taskStatusId = this.remainingTaskStatuses[0]?.id
    },

    async removeTaskStatus(taskStatusId) {
      await this.removeTaskStatusFromProduction(taskStatusId)
      await this.loadContext()
      this.taskStatusId = this.remainingTaskStatuses[0]?.id
    },

    async updateTaskStatusPriority() {
      await this.updateTaskStatusPriorities(this.taskStatusItems)
    },

    async updateTaskStatusPriorities(taskStatuses) {
      const taskStatusLinks = taskStatuses.map((taskStatus, index) => ({
        ...this.currentProduction.task_statuses_link[taskStatus.id],
        priority: index + 1,
        project_id: this.currentProduction.id,
        task_status_id: taskStatus.id
      }))
      for (const taskStatusLink of taskStatusLinks) {
        await this.editTaskStatusLink(taskStatusLink)
      }
      await this.loadContext()
    }
  },

  watch: {
    activeTab() {
      if (this.$route.query.tab !== this.activeTab) {
        this.$router.push({
          query: {
            tab: this.activeTab
          }
        })
      }
    },

    sortedProductionTaskStatuses: {
      immediate: true,
      handler() {
        this.taskStatusItems = JSON.parse(
          JSON.stringify(this.sortedProductionTaskStatuses)
        )
      }
    }
  },

  head() {
    return {
      title: `${this.currentProduction.name} | ${this.$t(
        'settings.title'
      )} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.datatable th {
  color: var(--text);
}
p {
  color: var(--text);
}
.fixed-page {
  display: flex;
}

.wrapper {
  margin-top: 0;
  overflow-y: scroll;
  padding: 2em;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tabs {
  min-height: 2em;
}

.tabs ul {
  margin-left: 0;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-left: 2px;
  padding-top: 0.5em;
}

h2.subtitle {
  color: $grey;
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 0.4em;
  text-transform: uppercase;
}

.field {
  margin-bottom: 0;
}

.list {
  width: 400px;
  min-width: 400px;
  max-width: 400px;

  .name {
    width: 100%;
  }
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

th {
  padding-left: 10px;
  padding-bottom: 5px;
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

.tabs {
  overflow-x: auto;
}

.tabs ul {
  flex-wrap: nowrap;
  white-space: nowrap;
}

@media screen and (max-width: 1000px) {
  .wrapper {
    padding: 1.5em 1em;
  }
}

@media screen and (max-width: 768px) {
  .wrapper {
    padding: 1em 0.75em;
  }

  .column {
    padding: 0.5em 0;
  }

  .columns {
    margin-bottom: 1em;
  }

  .box {
    padding: 1.5em;
  }

  /* Read-only mobile: hide add buttons / mutation widgets */
  .tab .has-text-right {
    display: none;
  }

  .tab > .flexrow.mt1.mb1 {
    display: none;
  }

  :deep(.tab .columns .column + .column) {
    display: none;
  }

  :deep(.tab .remove),
  :deep(.tab .grab),
  :deep(.tab td.remove),
  :deep(.tab td.grab),
  :deep(.tab .name-full) {
    display: none !important;
  }

  :deep(.background-settings .flexrow.mt1.mb1),
  :deep(.task-status-settings .add-task-status),
  :deep(.status-automation-settings .add-status-automation) {
    display: none;
  }

  :deep(.background-settings .datatable th:last-child),
  :deep(.background-settings .datatable td:last-child),
  :deep(.background-settings .is-default) {
    display: none !important;
  }

  :deep(.tab .datatable-row .button) {
    display: none !important;
  }

  :deep(.board-settings .roles .button) {
    display: none;
  }

  :deep(.board-settings .roles .bool-field) {
    pointer-events: none;
    opacity: 0.7;
  }

  :deep(.board-settings .datatable-row .roles .bool-field) {
    flex: 0 0 100% !important;
    width: 100% !important;
    margin-bottom: 0.35em;
  }

  /* Card mode for every list/table inside a tab */
  :deep(.tab .datatable),
  :deep(.tab .datatable.list),
  :deep(.tab table.list) {
    display: block;
    background: transparent;
    overflow-x: visible;
    min-width: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    white-space: normal;
  }

  :deep(.tab .columns),
  :deep(.tab .columns .column) {
    max-width: 100%;
    min-width: 0;
    width: auto;
  }

  :deep(.tab .datatable .datatable-head),
  :deep(.tab .datatable thead) {
    display: none;
  }

  :deep(.tab .datatable .datatable-body),
  :deep(.tab .datatable tbody) {
    display: block;
  }

  :deep(.tab .datatable .datatable-row),
  :deep(.tab .datatable .datatable-row:nth-child(even)),
  :deep(.tab .datatable .datatable-row:hover),
  :deep(.tab .datatable .datatable-row:last-child) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5em;
    padding: 0.6em 0.75em;
    margin-bottom: 0.5em;
    background-color: var(--background) !important;
    border: 1px solid var(--border);
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
    max-width: 100%;
  }

  :deep(.tab .datatable .datatable-row td),
  :deep(.tab .datatable .datatable-row:last-child td),
  :deep(.tab .datatable .datatable-row:last-child:nth-child(even) td),
  :deep(.tab .datatable .datatable-row:last-child:hover td) {
    display: block;
    padding: 0;
    border: 0;
    background-color: transparent !important;
    width: auto;
    min-width: 0;
    max-width: none;
  }
}
</style>
