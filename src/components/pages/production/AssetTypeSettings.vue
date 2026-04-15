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

const props = defineProps({
  assetTypes: { type: Array, default: () => [] },
  allAssetTypes: { type: Array, default: () => [] }
})

const emit = defineEmits(['add', 'remove'])

const loadingImport = ref(false)

const linkedIds = computed(() => new Set(props.assetTypes.map(a => a.id)))

const remainingAssetTypes = computed(() =>
  sortByName(props.allAssetTypes.filter(at => !linkedIds.value.has(at.id)))
)

const onImportItem = item => {
  const id = item && item.id ? item.id : item
  emit('add', id)
}

const onImportFromProduction = async productionId => {
  const productionMap = store.getters.productionMap
  const sourceProduction = productionMap?.get(productionId)
  if (!sourceProduction) return
  const sourceAssetTypeIds = sourceProduction.asset_types || []
  const toAdd = sourceAssetTypeIds.filter(id => !linkedIds.value.has(id))
  loadingImport.value = true
  try {
    for (const id of toAdd) {
      emit('add', id)
    }
  } finally {
    loadingImport.value = false
  }
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
