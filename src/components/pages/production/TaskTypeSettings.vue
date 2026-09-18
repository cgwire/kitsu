<template>
  <div class="task-type-settings">
    <div class="section-tabs tabs">
      <ul>
        <li
          v-for="tab in entityTabs"
          :key="tab.name"
          :class="{ 'is-active': entityTab === tab.name }"
        >
          <a
            role="button"
            tabindex="0"
            @click="entityTab = tab.name"
            @keydown.enter.prevent="entityTab = tab.name"
            @keydown.space.prevent="entityTab = tab.name"
            >{{ tab.label }}</a
          >
        </li>
      </ul>
    </div>

    <div class="columns">
      <div class="column">
        <div class="box" v-if="taskTypesForEntity.length === 0">
          {{ $t('settings.production.empty_list') }}
        </div>
        <table class="datatable list" v-else>
          <thead>
            <tr>
              <th class="th-grab"></th>
              <th>{{ $t('task_types.fields.name') }}</th>
              <th class="th-bitrate">
                {{ $t('productions.fields.hd_bitrate_short') }}
              </th>
              <th class="th-bitrate">
                {{ $t('productions.fields.ld_bitrate_short') }}
              </th>
              <th></th>
            </tr>
          </thead>
          <draggable
            class="datatable-body"
            item-key="id"
            tag="tbody"
            v-model="draggableList"
            @end="onReorder"
          >
            <template #item="{ element: taskType }">
              <tr class="datatable-row task-type">
                <td class="grab">
                  <grip-vertical-icon />
                </td>
                <task-type-cell :task-type="taskType" />
                <td class="bitrate" v-for="key in BITRATE_KEYS" :key="key">
                  <input
                    class="input"
                    type="number"
                    min="1"
                    max="200"
                    :placeholder="defaultBitrates[key] || ''"
                    :title="$t(`productions.fields.${key}`)"
                    :value="taskType[key] ?? ''"
                    @change="
                      onBitrateChange(taskType, key, $event.target.value)
                    "
                  />
                </td>
                <td class="remove">
                  <button class="button" @click="$emit('remove', taskType.id)">
                    {{ $t('main.remove') }}
                  </button>
                </td>
              </tr>
            </template>
          </draggable>
        </table>
      </div>
      <div class="column">
        <setting-importer
          :items="remainingTaskTypesForEntity"
          :loading-import="loadingImport"
          @import-item="onImportItem"
          @import-from-production="onImportFromProduction"
        >
          <template #item-line="{ item }">
            <task-type-name class="pointer" :task-type="item" />
          </template>
        </setting-importer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import draggable from 'vuedraggable'
import { GripVerticalIcon } from 'lucide-vue-next'

import { parseBitrate } from '@/lib/productions'
import { sortByName } from '@/lib/sorting'

import SettingImporter from '@/components/widgets/SettingImporter.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

const VALID_SECTIONS = ['assets', 'shots', 'sequences', 'episodes', 'edits']
const BITRATE_KEYS = ['hd_bitrate_compression', 'ld_bitrate_compression']

const props = defineProps({
  taskTypes: { type: Array, default: () => [] },
  allTaskTypes: { type: Array, default: () => [] },
  // Bitrates shown as placeholders when a task type inherits them.
  defaultBitrates: { type: Object, default: () => ({}) }
})

const emit = defineEmits([
  'add',
  'bitrates-changed',
  'import-items',
  'remove',
  'reorder'
])

const initialSection = VALID_SECTIONS.includes(route.query.section)
  ? route.query.section
  : 'assets'
const entityTab = ref(initialSection)
const draggableList = ref([])
const loadingImport = ref(false)

watch(entityTab, section => {
  // eslint-disable-next-line no-unused-vars
  const { search, ...rest } = route.query
  router.replace({ query: { ...rest, section } })
})

const entityTabs = computed(() => [
  { label: t('assets.title'), name: 'assets' },
  { label: t('shots.title'), name: 'shots' },
  { label: t('sequences.title'), name: 'sequences' },
  { label: t('episodes.title'), name: 'episodes' },
  { label: t('edits.title'), name: 'edits' }
])

const linkedIds = computed(() => new Set(props.taskTypes.map(tt => tt.id)))

const taskTypesForEntity = computed(() =>
  props.taskTypes.filter(
    tt => `${(tt.for_entity || '').toLowerCase()}s` === entityTab.value
  )
)

const remainingTaskTypesForEntity = computed(() =>
  sortByName(
    props.allTaskTypes.filter(
      tt =>
        !linkedIds.value.has(tt.id) &&
        `${(tt.for_entity || '').toLowerCase()}s` === entityTab.value
    )
  )
)

watch(
  taskTypesForEntity,
  list => {
    draggableList.value = [...list]
  },
  { immediate: true }
)

const onImportItem = item => {
  const id = item && item.id ? item.id : item
  emit('add', id)
}

const onImportFromProduction = async productionId => {
  const productionMap = store.getters.productionMap
  const sourceProduction = productionMap?.get(productionId)
  if (!sourceProduction) return
  const sourceTaskTypeIds = sourceProduction.task_types || []
  const toAdd = sourceTaskTypeIds.filter(id => {
    if (linkedIds.value.has(id)) return false
    const taskType = props.allTaskTypes.find(tt => tt.id === id)
    if (!taskType) return false
    return `${(taskType.for_entity || '').toLowerCase()}s` === entityTab.value
  })
  if (toAdd.length === 0) return
  loadingImport.value = true
  emit('import-items', {
    ids: toAdd,
    done: () => {
      loadingImport.value = false
    }
  })
}

const onBitrateChange = (taskType, key, value) => {
  const bitrates = Object.fromEntries(
    BITRATE_KEYS.map(k => [k, parseBitrate(taskType[k])])
  )
  bitrates[key] = parseBitrate(value)
  emit('bitrates-changed', { taskTypeId: taskType.id, ...bitrates })
}

const onReorder = () => {
  const ordered = draggableList.value.map((tt, index) => ({
    taskTypeId: tt.id,
    priority: index + 1
  }))
  emit('reorder', ordered)
}
</script>

<style lang="scss" scoped>
.section-tabs {
  margin-bottom: 0.5em;
}

.section-tabs ul {
  margin-left: 0;
  margin-right: 0;
}

.section-tabs li + li {
  margin: 0;
}

.columns {
  margin-top: 0.5em;
  justify-content: flex-start;
  gap: 1em;
}

.column {
  overflow-y: initial;
  flex: 0 0 auto;
  max-width: 600px;
}

.list {
  width: 600px;
  min-width: 600px;
  max-width: 600px;

  .name {
    width: 100%;
  }
}

.bitrate {
  min-width: 120px;
  width: 120px;

  input {
    width: 100px;
  }
}

.box {
  max-width: 600px;
}

.datatable th {
  color: var(--text);
  padding-left: 10px;
  padding-top: 1em;
}

.th-grab {
  width: 30px;
}

.th-bitrate {
  min-width: 120px;
  white-space: nowrap;
}

.task-type {
  cursor: grab;
}

.task-type[draggable='true'] {
  cursor: grabbing;
}

.grab {
  cursor: grab;
  padding-top: 1em;
  width: 30px;
  color: $grey;
}
</style>
