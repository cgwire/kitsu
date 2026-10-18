<template>
  <div class="production-settings fixed-page" ref="page">
    <div class="wrapper">
      <nav class="settings-menu">
        <div class="menu-group" v-for="group in menuGroups" :key="group.label">
          <p class="menu-label">{{ $t(group.label) }}</p>
          <ul>
            <li
              :class="{ 'is-active': isActiveTab(item.id) }"
              :key="item.id"
              v-for="item in group.items"
            >
              <router-link
                :aria-current="isActiveTab(item.id) ? 'page' : undefined"
                :to="{ query: { tab: item.id } }"
              >
                {{ $t(item.label) }}
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <div class="settings-content">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useFieldCommitOnLeave } from '@/composables/fieldCommit'
import { sortTaskStatuses } from '@/lib/sorting'

import { GripVerticalIcon } from 'lucide-vue-next'

import AssetTypeSettings from '@/components/pages/production/AssetTypeSettings.vue'
import BooleanCell from '@/components/cells/BooleanCell.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ProductionBackgrounds from '@/components/pages/production/ProductionBackgrounds.vue'
import ProductionBoard from '@/components/pages/production/ProductionBoard.vue'
import ProductionBrief from '@/components/pages/production/ProductionBrief.vue'
import ProductionClients from '@/components/pages/production/ProductionClients.vue'
import ProductionParameters from '@/components/pages/production/ProductionParameters.vue'
import ProductionStatusAutomations from '@/components/pages/production/ProductionStatusAutomations.vue'
import ProductionTaskTypes from '@/components/pages/production/ProductionTaskTypes.vue'
import ProductionVideoSettings from '@/components/pages/production/ProductionVideoSettings.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

const activeTab = ref('parameters')

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
const taskStatusItems = ref([])
const taskStatusId = ref('')

const assetTypes = computed(() => store.getters.assetTypes)
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserProductionManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
// The asset-type tab edits the production's explicit restriction set, so it
// shows the raw asset_types (empty = no restriction). productionAssetTypes
// can't be used here: it expands an empty list to every asset type, which
// made removing the last type repaint the whole list and blocked removal.
const restrictedAssetTypes = computed(() => {
  const ids = currentProduction.value?.asset_types
  if (!ids?.length) return []
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

const addTaskStatus = async () => {
  await store.dispatch('addTaskStatusToProduction', taskStatusId.value)
  await store.dispatch('loadContext')
  taskStatusId.value = remainingTaskStatuses.value[0]?.id
}

const removeTaskStatus = async id => {
  await store.dispatch('removeTaskStatusFromProduction', id)
  await store.dispatch('loadContext')
  taskStatusId.value = remainingTaskStatuses.value[0]?.id
}

const updateTaskStatusPriorities = async taskStatuses => {
  // The batch route sets each priority from the list order and preserves
  // the board roles of every link.
  await store.dispatch('reorderTaskStatusLinks', {
    projectId: currentProduction.value.id,
    taskStatusIds: taskStatuses.map(status => status.id)
  })
  await store.dispatch('loadContext')
}

const updateTaskStatusPriority = async () => {
  await updateTaskStatusPriorities(taskStatusItems.value)
}

watch(
  () => route.query.tab,
  tab => {
    if (tab) activeTab.value = tab
  }
)

watch(activeTab, tab => {
  if (route.query.tab !== tab) {
    router.push({ query: { tab } })
  }
})

watch(
  sortedProductionTaskStatuses,
  list => {
    taskStatusItems.value = JSON.parse(JSON.stringify(list))
  },
  { immediate: true }
)

useHead({
  title: computed(
    () => `${currentProduction.value?.name} | ${t('settings.title')} - Kitsu`
  )
})

// The task type bitrates read the current production when they save.
useFieldCommitOnLeave(
  useTemplateRef('page'),
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
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
})
</script>

<style lang="scss" scoped>
.fixed-page {
  display: flex;
}

.wrapper {
  background: var(--background-page);
  margin-top: 0;
  overflow-y: scroll;
  padding: 1.5em 1em 1em;
  flex: 1;
  display: flex;
  gap: 1.5em;
}

.settings-menu {
  align-self: flex-start;
  background: var(--background-panel);
  border-radius: 12px;
  flex: 0 0 220px;
  padding: 1.5em 1em 1em;
  position: sticky;
  top: 0;

  .menu-group + .menu-group {
    margin-top: 1.5em;
  }

  .menu-label {
    color: var(--text-alt);
    font-size: 0.8em;
    letter-spacing: 0.1em;
    margin-bottom: 0.5em;
    text-transform: uppercase;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin-bottom: 0.2em;
  }

  a {
    border-radius: 8px;
    color: var(--text-panel);
    cursor: pointer;
    display: block;
    padding: 0.4em 0.8em;

    &:hover {
      background: var(--background-hover);
    }
  }

  .is-active a,
  .is-active a:hover {
    background: var(--background-selected);
    color: var(--text-strong);
    font-weight: 600;
  }
}

.settings-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  overflow-y: auto;
  padding-left: 2px;

  // Workflow tabs hold lists and tables, they need more room than forms.
  &.is-wide {
    max-width: 1200px;
  }

  // The look of the setting blocks of every tab lives here. Wide tables
  // scroll inside their block instead of stretching it.
  // Same look as the .block panels of the entity pages (Shot.vue)
  :deep(.section) {
    background: var(--background-block);
    border: 1px solid var(--border);
    border-radius: 1em;
    box-shadow: 0 0 6px var(--box-shadow);
    margin-bottom: 1em;
    overflow-x: auto;
    padding: 1.5em;
  }

  // Empty list messages: modals also render a .box here, hence the parents.
  :deep(.column > .box),
  :deep(.background-settings > .box),
  :deep(.board-settings > .box) {
    border-radius: 12px;
  }

  // Direct children only: the Clients preview header lays out its own title.
  // The shared list components (asset types, task types, automations,
  // board) have fixed widths for the studio template page: here they fill
  // their panel.
  :deep(.section .columns > .column:first-child) {
    flex: 1 1 auto;
    max-width: none;
  }

  :deep(.section .datatable),
  :deep(.section .list),
  :deep(.section .columns > .column > .box),
  :deep(.section > .box) {
    max-width: none;
    min-width: 0;
    width: 100%;
  }

  :deep(.section .datatable) {
    border-radius: 10px;
    overflow: hidden;
  }

  :deep(.section .datatable th) {
    background: transparent;
  }

  :deep(.section > .subtitle) {
    border-bottom: 0;
    margin-bottom: 1.5em;
    margin-top: 0;
  }

  :deep(.explanation) {
    color: var(--text-alt);
  }

  // Same look as the TextField description, for the Checkbox that has no
  // description prop.
  :deep(.field-help) {
    color: var(--text-alt);
    font-size: 0.9em;
    margin-top: 0.4em;
  }

  // Short numeric settings: the input sits on the left of its label, the
  // description on its own line below.
  :deep(.number-line) {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6em;

    .label {
      margin-bottom: 0;
    }

    .control {
      flex: 0 0 auto;
      order: -1;
    }

    .help {
      flex: 0 0 100%;
      margin-top: 0;
    }

    .input {
      padding: 0.3em 0.3em;
      width: 45px;
      height: 35px;
    }
  }
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

// Light theme only: on the grey page the panel grey would blend in.
:global(.theme:not(.dark) .production-settings .settings-menu) {
  background: var(--background);
}

// Dark theme keeps the background App.vue gives to .dark .box
:global(.dark .production-settings .tab .section) {
  background: #3d4048;
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
  .wrapper {
    flex-direction: column;
    gap: 1em;
    padding: 1em;
  }

  .settings-menu {
    align-self: stretch;
    flex: 0 0 auto;
    overflow-x: auto;
    padding: 0.5em;
    position: static;

    &,
    ul {
      display: flex;
      gap: 0.5em;
      white-space: nowrap;
    }

    .menu-group + .menu-group {
      margin-top: 0;
    }

    .menu-label {
      display: none;
    }
  }

  .tab :deep(.section) {
    padding: 1.5em;
  }

  .add-task-status,
  :deep(.production-brief .edit-hint) {
    display: none;
  }

  :deep(.tab .columns .column + .column) {
    display: none;
  }

  :deep(.tab .remove),
  :deep(.tab .grab),
  :deep(.tab .name-full) {
    display: none !important;
  }

  :deep(.background-settings .flexrow.mt1.mb1),
  :deep(.production-task-types .add-task-type),
  :deep(.status-automation-settings .add-status-automation) {
    display: none;
  }

  :deep(.background-settings .datatable th:last-child),
  :deep(.background-settings .datatable td:last-child),
  :deep(.background-settings .is-default),
  :deep(.production-task-types .bitrate) {
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
