<template>
  <div class="asset-type-settings">
    <div class="columns">
      <div class="column">
        <div class="box" v-if="assetTypes.length === 0">
          {{ $t('settings.production.empty_list') }}
        </div>
        <table class="datatable list" v-else>
          <thead class="datatable-head">
            <tr class="datatable-row-header">
              <th scope="col" class="name">
                {{ $t('asset_types.fields.name') }}
              </th>
              <th scope="col" class="workflow">
                {{ $t('asset_types.fields.task_types') }}
              </th>
              <th scope="col" class="origin"></th>
              <th scope="col" class="remove"></th>
            </tr>
          </thead>
          <tbody class="datatable-body">
            <tr
              class="datatable-row"
              v-for="assetType in assetTypes"
              :key="assetType.id"
            >
              <td class="name">{{ assetType.name }}</td>
              <td class="workflow">
                <div class="flexrow task-types">
                  <span class="workflow-combo">
                    <combobox-task-type-options
                      :hidden="getHiddenTaskTypeIds(assetType.id)"
                      :task-types="taskTypes"
                      teleported
                      @update:hidden="onHiddenChanged(assetType.id, $event)"
                    />
                  </span>
                  <div class="workflow-tags">
                    <span v-if="!getWorkflow(assetType.id).length">
                      {{ $t('asset_types.include_all') }}
                    </span>
                    <task-type-name
                      :is-link="false"
                      :key="taskType.id"
                      :task-type="taskType"
                      v-for="taskType in getTaskTypes(assetType.id)"
                    />
                  </div>
                </div>
              </td>
              <td class="origin">
                <div class="origin-content" v-if="hasOwnWorkflow(assetType.id)">
                  <span class="tag">
                    {{ $t('asset_types.workflow_production') }}
                  </span>
                  <button
                    class="button is-link restore-workflow"
                    @click="saveWorkflow(assetType.id, [])"
                  >
                    {{ $t('asset_types.restore_studio_workflow') }}
                  </button>
                </div>
                <span class="tag" v-else>
                  {{ $t('asset_types.workflow_studio') }}
                </span>
              </td>
              <td class="remove">
                <button class="button" @click="$emit('remove', assetType.id)">
                  {{ $t('main.remove') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="column">
        <setting-importer
          :items="remainingAssetTypes"
          :loading-import="loadingImport"
          @import-item="onImportItem"
          @import-from-production="onImportFromProduction"
        >
          <template #item-line="{ item }">
            <span class="pointer">{{ item.name }}</span>
          </template>
        </setting-importer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { sortByName } from '@/lib/sorting'

import ComboboxTaskTypeOptions from '@/components/widgets/ComboboxTaskTypeOptions.vue'
import SettingImporter from '@/components/widgets/SettingImporter.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  assetTypes: { type: Array, default: () => [] },
  allAssetTypes: { type: Array, default: () => [] },
  // The asset task types of the production or template, in display order.
  taskTypes: { type: Array, default: () => [] },
  // The workflows of the production or template, by asset type id.
  workflows: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['add', 'import-items', 'remove', 'update-workflow'])

// State
// --------------------------------------------------------------------------
const loadingImport = ref(false)

// Computed
// --------------------------------------------------------------------------
const linkedIds = computed(() => new Set(props.assetTypes.map(a => a.id)))

const remainingAssetTypes = computed(() =>
  sortByName(props.allAssetTypes.filter(at => !linkedIds.value.has(at.id)))
)

// Functions
// --------------------------------------------------------------------------
const hasOwnWorkflow = assetTypeId =>
  Boolean(props.workflows[assetTypeId]?.length)

const getWorkflow = assetTypeId =>
  hasOwnWorkflow(assetTypeId)
    ? props.workflows[assetTypeId]
    : store.getters.assetTypeMap.get(assetTypeId)?.task_types || []

// Zou accepts only the task types of the production or template: the ones a
// studio workflow lists outside of it are neither shown nor sent back.
const getTaskTypes = assetTypeId => {
  const workflow = getWorkflow(assetTypeId)
  return props.taskTypes.filter(({ id }) => workflow.includes(id))
}

// An empty workflow accepts all the task types: none of them is hidden.
const getHiddenTaskTypeIds = assetTypeId => {
  if (!getWorkflow(assetTypeId).length) return []
  const shownIds = getTaskTypes(assetTypeId).map(({ id }) => id)
  return props.taskTypes
    .map(({ id }) => id)
    .filter(id => !shownIds.includes(id))
}

const saveWorkflow = (assetTypeId, taskTypeIds) =>
  emit('update-workflow', { assetTypeId, taskTypeIds })

// Hiding them all saves an empty list: back to the studio workflow.
const onHiddenChanged = (assetTypeId, hiddenIds) => {
  const taskTypeIds = props.taskTypes
    .map(({ id }) => id)
    .filter(id => !hiddenIds.includes(id))
  saveWorkflow(assetTypeId, taskTypeIds)
}

const onImportItem = item => emit('add', item?.id || item)

const onImportFromProduction = productionId => {
  const sourceProduction = store.getters.productionMap?.get(productionId)
  if (!sourceProduction) return
  const toAdd = (sourceProduction.asset_types || []).filter(
    id => !linkedIds.value.has(id)
  )
  if (toAdd.length === 0) return
  loadingImport.value = true
  emit('import-items', {
    ids: toAdd,
    done: () => {
      loadingImport.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.columns {
  margin-top: 0.5em;
  justify-content: flex-start;
  gap: 1em;
}

.column {
  overflow-y: initial;
  flex: 0 1 auto;
  max-width: 900px;

  // Asset type names are short: sized on its content, the importer was a
  // narrow strip
  & + .column {
    flex: 0 0 360px;
    width: 360px;
  }
}

.list {
  width: 100%;

  .name,
  .origin {
    white-space: nowrap;
  }

  .origin-content {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }

  .origin .tag {
    .dark & {
      background: $dark-grey-lightest;
      color: var(--text);
    }
  }

  .restore-workflow {
    font-size: 0.8em;
    height: auto;
    padding: 0.1em 0.5em;
  }

  .workflow-combo {
    flex: 0 0 auto;
    min-width: 80px;
  }

  // Wrapped tags stay aligned on the first ones, not under the combobox.
  .workflow-tags {
    display: flex;
    flex: 1 1 0;
    flex-wrap: wrap;
    gap: 0.5em;
    min-width: 0;
  }

  td.workflow {
    vertical-align: middle;
  }

  .task-types {
    align-items: center;
    gap: 0.5em;
  }
}

.box {
  max-width: 400px;
}
</style>
