<template>
  <div class="asset-type-settings">
    <div class="columns">
      <div class="column">
        <div class="box" v-if="assetTypes.length === 0">
          {{ $t('settings.production.empty_list') }}
        </div>
        <table class="datatable list" v-else>
          <tbody class="datatable-body">
            <tr
              class="datatable-row"
              v-for="assetType in assetTypes"
              :key="assetType.id"
            >
              <td class="name">{{ assetType.name }}</td>
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

import SettingImporter from '@/components/widgets/SettingImporter.vue'

const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  assetTypes: { type: Array, default: () => [] },
  allAssetTypes: { type: Array, default: () => [] }
})

const emit = defineEmits(['add', 'import-items', 'remove'])

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
  flex: 0 0 auto;
  max-width: 400px;

  // Asset type names are short: sized on its content, the importer was a
  // narrow strip
  & + .column {
    flex: 0 0 360px;
    width: 360px;
  }
}

.list {
  width: 400px;
  min-width: 400px;
  max-width: 400px;

  .name {
    width: 100%;
  }
}

.box {
  max-width: 400px;
}
</style>
