<template>
  <settings-layout
    class="production-settings fixed-page"
    ref="page"
    :active-tab="activeTab"
    :menu-groups="menuGroups"
  >
    <div class="tab" v-show="isActiveTab('parameters')">
      <production-parameters />
    </div>

    <div class="tab" v-show="isActiveTab('clients')">
      <production-clients />
    </div>

    <div class="tab" v-show="isActiveTab('video')">
      <production-video-settings />
    </div>

    <div class="tab" v-show="isActiveTab('brief')">
      <production-brief />
    </div>

    <div class="tab is-wide" v-show="isActiveTab('assetTypes')">
      <div class="box section">
        <h2 class="subtitle">{{ $t('asset_types.title') }}</h2>
        <asset-type-settings
          :asset-types="restrictedAssetTypes"
          :all-asset-types="assetTypes"
          @add="addAssetType"
          @import-items="importAssetTypes"
          @remove="removeAssetType"
        />
      </div>
    </div>

    <div class="tab is-wide" v-show="isActiveTab('taskTypes')">
      <div class="box section">
        <h2 class="subtitle">{{ $t('task_types.title') }}</h2>
        <production-task-types />
      </div>
    </div>

    <div class="tab is-wide" v-show="isActiveTab('taskStatus')">
      <div class="box section">
        <h2 class="subtitle">{{ $t('task_status.title') }}</h2>
        <p class="explanation mb1">
          {{ $t('task_status.production_description') }}
        </p>
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
        <div class="box" v-if="isEmpty(currentProduction?.task_statuses)">
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
              <th class="th-bool">
                {{ $t('task_status.fields.is_done') }}
              </th>
              <th class="th-bool">
                {{ $t('task_status.fields.is_retake') }}
              </th>
              <th class="th-bool">
                {{ $t('task_status.fields.is_artist_allowed') }}
              </th>
              <th class="th-bool">
                {{ $t('task_status.fields.is_client_allowed') }}
              </th>
            </tr>
          </thead>
          <!-- A held button must not arm a drag: a reload that shifted
               the rows before the release made vuedraggable throw. -->
          <draggable
            class="datatable-body"
            filter="button"
            item-key="id"
            :prevent-on-filter="false"
            tag="tbody"
            v-model="taskStatusItems"
            @choose="onRowHeld"
            @end="updateTaskStatusPriority"
            @start="onRowDragged"
            @unchoose="onRowReleased"
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
    </div>

    <div class="tab is-wide" v-show="isActiveTab('board')">
      <div class="box section">
        <h2 class="subtitle">{{ $t('board.settings.title') }}</h2>
        <production-board />
      </div>
    </div>

    <div class="tab is-wide" v-show="isActiveTab('statusAutomations')">
      <div class="box section">
        <h2 class="subtitle">{{ $t('status_automations.title') }}</h2>
        <production-status-automations />
      </div>
    </div>

    <div class="tab" v-show="isActiveTab('backgrounds')">
      <div class="box section">
        <h2 class="subtitle">{{ $t('backgrounds.title') }}</h2>
        <production-backgrounds />
      </div>
    </div>
  </settings-layout>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import { GripVerticalIcon } from 'lucide-vue-next'
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { useStore } from 'vuex'

import { useDraggableRebuild } from '@/composables/draggableRebuild'
import { useFieldCommitOnLeave } from '@/composables/fieldCommit'
import { sortTaskStatuses } from '@/lib/sorting'

import BooleanCell from '@/components/cells/BooleanCell.vue'
import AssetTypeSettings from '@/components/pages/production/AssetTypeSettings.vue'
import ProductionBackgrounds from '@/components/pages/production/ProductionBackgrounds.vue'
import ProductionBoard from '@/components/pages/production/ProductionBoard.vue'
import ProductionBrief from '@/components/pages/production/ProductionBrief.vue'
import ProductionClients from '@/components/pages/production/ProductionClients.vue'
import ProductionParameters from '@/components/pages/production/ProductionParameters.vue'
import ProductionStatusAutomations from '@/components/pages/production/ProductionStatusAutomations.vue'
import ProductionTaskTypes from '@/components/pages/production/ProductionTaskTypes.vue'
import ProductionVideoSettings from '@/components/pages/production/ProductionVideoSettings.vue'
import SettingsLayout from '@/components/pages/production/SettingsLayout.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------
const menuGroups = [
  {
    label: 'productions.settings_menu.production',
    items: [
      { id: 'parameters', label: 'productions.parameters.title' },
      { id: 'brief', label: 'productions.brief.title' },
      { id: 'clients', label: 'productions.clients.title' },
      { id: 'video', label: 'productions.video.title' },
      { id: 'backgrounds', label: 'backgrounds.title' }
    ]
  },
  {
    label: 'productions.settings_menu.workflow',
    items: [
      { id: 'assetTypes', label: 'asset_types.title' },
      { id: 'taskTypes', label: 'task_types.title' },
      { id: 'taskStatus', label: 'task_status.title' },
      { id: 'statusAutomations', label: 'status_automations.title' },
      { id: 'board', label: 'board.settings.title' }
    ]
  }
]
const tabIds = menuGroups.flatMap(group => group.items.map(item => item.id))
const activeTab = ref('parameters')
const taskStatusItems = ref([])
const taskStatusId = ref('')
const layout = useTemplateRef('page')

// Computed
// --------------------------------------------------------------------------
const assetTypes = computed(() => store.getters.assetTypes)
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserProductionManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const restrictedAssetTypes = computed(() => {
  const ids = currentProduction.value?.asset_types ?? []
  return assetTypes.value.filter(assetType => ids.includes(assetType.id))
})
const productionTaskStatuses = computed(
  () => store.getters.productionTaskStatuses
)
const taskStatus = computed(() => store.getters.taskStatus)

const remainingTaskStatuses = computed(() =>
  taskStatus.value.filter(
    status =>
      !currentProduction.value?.task_statuses?.includes(status.id) &&
      !status.for_concept
  )
)

const sortedProductionTaskStatuses = computed(() =>
  sortTaskStatuses(productionTaskStatuses.value, currentProduction.value)
)

// Functions
// --------------------------------------------------------------------------
const isEmpty = list => !list || list.length === 0
const isActiveTab = tab => activeTab.value === tab

const addAssetType = assetTypeId => {
  store.dispatch('addAssetTypeToProduction', assetTypeId)
}

const importAssetTypes = async ({ ids, done }) => {
  try {
    await store.dispatch('addSettingsToProduction', { assetTypeIds: ids })
  } catch (err) {
    console.error(err)
  }
  done()
}

const removeAssetType = assetTypeId => {
  store.dispatch('removeAssetTypeFromProduction', assetTypeId)
}

const changeTaskStatuses = async (action, payload) => {
  await store.dispatch(action, payload)
  await store.dispatch('loadContext')
  taskStatusId.value = remainingTaskStatuses.value[0]?.id
}

const addTaskStatus = () =>
  changeTaskStatuses('addTaskStatusToProduction', taskStatusId.value)

const removeTaskStatus = id =>
  changeTaskStatuses('removeTaskStatusFromProduction', id)

const updateTaskStatusPriority = async () => {
  try {
    await store.dispatch('reorderTaskStatusLinks', {
      projectId: currentProduction.value.id,
      taskStatusIds: taskStatusItems.value.map(status => status.id)
    })
  } catch (err) {
    // After a drop, the list waits for the reload that a failure never does.
    resetTaskStatusItems()
    throw err
  }
  await store.dispatch('loadContext')
}

const {
  rebuild: resetTaskStatusItems,
  onRowHeld,
  onRowDragged,
  onRowReleased
} = useDraggableRebuild(() => {
  taskStatusItems.value = JSON.parse(
    JSON.stringify(sortedProductionTaskStatuses.value)
  )
})

// Watchers
// --------------------------------------------------------------------------
watch(
  () => route.query.tab,
  tab => {
    if (tabIds.includes(tab)) activeTab.value = tab
  },
  { immediate: true }
)

watch(activeTab, tab => {
  if (route.query.tab !== tab) {
    router.push({ query: { tab } })
  }
})

watch(sortedProductionTaskStatuses, resetTaskStatusItems, { immediate: true })

// Lifecycle
// --------------------------------------------------------------------------
useFieldCommitOnLeave(
  computed(() => layout.value?.$el),
  (to, from) => to.params.production_id !== from.params.production_id
)

onMounted(() => {
  if (!isCurrentUserProductionManager.value) {
    router.push({ name: 'not-found' })
    return
  }

  if (remainingTaskStatuses.value.length > 0) {
    taskStatusId.value = remainingTaskStatuses.value[0].id
  }
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(
    () => `${currentProduction.value?.name} | ${t('settings.title')} - Kitsu`
  )
})
</script>

<style lang="scss" scoped>
.fixed-page {
  display: flex;
}

.field {
  margin-bottom: 0;
}

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

.th-bool {
  width: 140px;
}

.box {
  border-radius: 12px;
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

// Tablet: the content area is about 500px wide next to the menu.
// The automation and background lists are shared with the studio pages:
// their column widths are only adjusted in the production tabs.
@media screen and (min-width: 769px) {
  .tab :deep(.status-automation-settings .datatable) {
    width: 100%;

    td {
      vertical-align: middle;
    }

    .name {
      min-width: 130px;
      width: 130px;
    }

    .in-task-type,
    .out-task-type {
      min-width: 170px;
      width: 170px;
    }

    .in-task-status,
    .out-task-status {
      min-width: 130px;
      width: 130px;
    }

    .automation-type,
    .input-separator {
      min-width: 170px;
      text-align: center;
      width: 170px;
    }

    .import-last-revision {
      min-width: 140px;
      text-align: center;
      width: 140px;
    }
  }

  .tab :deep(.background-settings .datatable) {
    width: 100%;

    td {
      vertical-align: middle;
    }

    .name {
      min-width: 0;
      width: auto;
    }

    .is-default {
      width: 140px;
    }

    th:last-child,
    td:last-child {
      text-align: right;
      white-space: nowrap;
      width: 1%;
    }
  }
}

@media screen and (max-width: 1000px) {
  .th-name,
  .th-short-name,
  .th-bool {
    white-space: normal;
    width: auto;
  }

  // The list and the importer stack instead of overflowing side by side.
  :deep(.tab .asset-type-settings .columns),
  :deep(.tab .production-task-types .columns) {
    flex-wrap: wrap;
  }

  :deep(.tab .background-settings .name),
  :deep(.tab .background-settings .is-default) {
    min-width: 0;
    width: auto;
  }
}

@media screen and (max-width: 768px) {
  .add-task-status,
  :deep(.production-brief .edit-hint) {
    display: none;
  }

  // The clients tab is read-only on a phone: no account action, no toggle.
  :deep(.production-clients .create-button),
  :deep(.production-clients .copy-button),
  :deep(.production-clients .actions),
  :deep(.production-clients .statuses-reset) {
    display: none;
  }

  :deep(.production-clients .checkbox-field) {
    pointer-events: none;
  }

  :deep(.production-task-types .add-task-type) {
    display: none;
  }

  :deep(.production-task-types .bitrate) {
    display: none !important;
  }
}
</style>
