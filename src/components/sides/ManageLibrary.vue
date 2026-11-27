<template>
  <div class="side-wrapper">
    <div class="extend-bar" v-if="extendable"></div>
    <div class="side manage-library">
      <div class="flexrowcolumn" v-if="selectedEntities.length">
        <delete-entities
          :error-text="$t('assets.multiple_delete_error')"
          :is-loading="loading"
          :is-error="error"
          :text="
            $t('library.remove_selected_assets', {
              count: selectedEntities.length,
              nbSelectedAssets: selectedEntities.length
            })
          "
          @confirm="removeSharedEntities"
        />
        <div class="has-text-centered pa1">
          <a
            role="button"
            tabindex="0"
            @click="clearSelectedAssets()"
            @keydown.enter.prevent="clearSelectedAssets()"
            @keydown.space.prevent="clearSelectedAssets()"
            >{{ $t('main.clear_selection') }}</a
          >
        </div>
      </div>

      <hr v-if="selectedEntities.length" />

      <h2 class="mt0">{{ $t('library.manage') }}</h2>
      <div class="has-text-centered mt2" v-if="!openProductions.length">
        {{ $t('library.no_open_productions') }}
      </div>

      <template v-else>
        <div class="flexcolumn mt2">
          <combobox-production
            class="flexrow-item"
            :label="$t('library.select_production')"
            :production-list="openProductions"
            :with-margin="false"
            v-model="productionId"
          />
          <combobox
            class="flexrow-item mt2"
            :disabled="!productionId"
            :label="$t('library.select_asset_type')"
            :options="productionEntityTypes"
            :with-margin="false"
            v-model="entityTypeId"
          />
        </div>
        <div class="flexcolumn mt2">
          <button-simple
            class="flexrow-item mb05"
            :disabled="!productionId"
            :is-loading="loading"
            :text="$t('library.import_from_production')"
            @click="importFromProduction"
          />

          <button-simple
            class="flexrow-item"
            :disabled="!productionId"
            :is-loading="loading"
            :text="$t('library.import_from_asset_type')"
            @click="importFromAssetType"
          />
          <hr class="mt1" />

          <button-simple
            class="flexrow-item"
            :disabled="!entityIds.length"
            :is-loading="loading"
            :text="$t('library.import_from_list')"
            @click="importFromEntityIds"
          />
        </div>
        <div class="flexcolumn">
          <div class="mt1" v-if="!productionUnsharedEntities.length">
            {{ $t('library.no_entities') }}
          </div>
          <div class="unshared-entities mt1" v-else>
            <table class="datatable">
              <tr
                class="datatable-row"
                :key="entity.id"
                v-for="entity in productionUnsharedEntities"
              >
                <td
                  class="datatable-row-header pointer"
                  role="button"
                  tabindex="0"
                  @click="toggleEntity(entity)"
                  @keydown.enter.prevent="toggleEntity(entity)"
                  @keydown.space.prevent="toggleEntity(entity)"
                >
                  <div class="flexrow">
                    <input
                      type="checkbox"
                      class="flexrow-item"
                      :checked="isSelected(entity)"
                    />
                    <entity-thumbnail
                      class="entity-thumbnail flexrow-item"
                      :entity="entity"
                      :width="50"
                      :height="30"
                      :empty-width="50"
                      :empty-height="32"
                    />
                    <span class="entity-name ml05">
                      {{ entity.name }}
                    </span>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import DeleteEntities from '@/components/tops/actions/DeleteEntities.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'

// Composables
// --------------------------------------------------------------------------

const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------

defineProps({
  extendable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['library-updated'])

// State
// --------------------------------------------------------------------------

const entityIds = ref([])
const entityTypeId = ref(null)
const error = ref(false)
const loading = ref(false)
const productionId = ref(null)

// Computed
// --------------------------------------------------------------------------

const assetTypeMap = computed(() => store.getters.assetTypeMap)
const assetTypes = computed(() => store.getters.assetTypes)
const openProductions = computed(() => store.getters.openProductions)
const productionMap = computed(() => store.getters.productionMap)
const selectedAssets = computed(() => store.getters.selectedAssets)
const unsharedAssets = computed(() => store.getters.unsharedAssets)

const productionEntityTypes = computed(() => {
  const production = productionMap.value.get(productionId.value)
  if (!production) return []

  const types = !production.asset_types?.length
    ? assetTypes.value
    : assetTypes.value.filter(type => production.asset_types.includes(type.id))

  return types.map(type => ({ label: type.name, value: type.id }))
})

const productionUnsharedEntities = computed(() =>
  unsharedAssets.value.filter(
    entity =>
      entity.project_id === productionId.value &&
      entity.entity_type_id === entityTypeId.value
  )
)

const selectedEntities = computed(() => [...selectedAssets.value.values()])

// Functions
// --------------------------------------------------------------------------

const clearSelectedAssets = () => store.dispatch('clearSelectedAssets')

const isSelected = entity => entityIds.value.includes(entity.id)

const toggleEntity = (entity, force = false) => {
  if (force || !isSelected(entity)) {
    entityIds.value.push(entity.id)
  } else {
    entityIds.value = entityIds.value.filter(id => id !== entity.id)
  }
}

const refresh = async () => {
  loading.value = true
  entityIds.value = []
  const production = productionMap.value.get(productionId.value)
  try {
    await store.dispatch('loadUnsharedAssets', { production })
  } catch (err) {
    console.error(err)
  }
  loading.value = false
}

const shareAndRefresh = async payload => {
  loading.value = true
  try {
    await store.dispatch('shareAssets', payload)
    emit('library-updated')
  } catch (err) {
    console.error(err)
  }
  loading.value = false
  await refresh()
}

const importFromProduction = () =>
  shareAndRefresh({ production: productionMap.value.get(productionId.value) })

const importFromAssetType = () =>
  shareAndRefresh({
    production: productionMap.value.get(productionId.value),
    assetType: assetTypeMap.value.get(entityTypeId.value)
  })

const importFromEntityIds = () => shareAndRefresh({ assetIds: entityIds.value })

const removeSharedEntities = async () => {
  loading.value = true
  error.value = false
  try {
    await store.dispatch('unshareAssets', {
      assetIds: selectedEntities.value.map(entity => entity.id)
    })
    emit('library-updated')
    clearSelectedAssets()
  } catch (err) {
    console.error(err)
    error.value = true
  }
  loading.value = false
  await refresh()
}

// Watchers
// --------------------------------------------------------------------------

watch(productionId, () => {
  refresh()
})

// Lifecycle
// --------------------------------------------------------------------------

onMounted(async () => {
  productionId.value = openProductions.value[0]?.id
  nextTick(() => {
    entityTypeId.value = productionEntityTypes.value[0]?.value
  })
  await refresh()
})
</script>

<style lang="scss" scoped>
.dark {
  .extend-bar {
    background: #46494f;
  }

  .side {
    background: #36393f;
    color: $white;
  }
}

.extend-bar {
  width: 3px;
  margin-left: 3px;
  background: #ccc;
}

.side-wrapper {
  display: flex;
  align-items: stretch;
  min-height: 100%;
}

.side {
  flex: 1;
  overflow: auto;
  background: #f8f8f8;
  min-height: 100%;
}

.manage-library {
  padding: 1em;

  // every control takes the width of the panel
  .flexrow-item {
    margin-right: 0;
  }

  .button,
  :deep(.production-combo),
  :deep(.select),
  :deep(.select-input) {
    width: 100%;
  }
}

.mt0 {
  margin-top: 0;
}

.unshared-entities {
  min-height: 200px;
  max-height: calc(100vh - 530px);
  overflow: hidden auto;

  .entity-name {
    font-weight: bold;
  }
}
</style>
