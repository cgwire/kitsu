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
            $tc('library.remove_selected_assets', selectedEntities.length, {
              nbSelectedAssets: selectedEntities.length
            })
          "
          @confirm="removeSharedEntities(selectedEntities)"
        />
        <div class="has-text-centered pa1">
          <a @click="clearSelectedAssets()">{{ $t('main.clear_selection') }}</a>
        </div>
        <!--h1 class="title mt05">{{ $tc('tasks.selected_entities') }}</h1>
        <div class="pa2 mt1">
          <div
            class="entity-line"
            :key="entity.id"
            v-for="entity in selectedEntities"
          >
            {{ entity.full_name }}
          </div>
        </div-->
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
            @click="importFromProduction(productionId)"
          />

          <button-simple
            class="flexrow-item"
            :disabled="!productionId"
            :is-loading="loading"
            :text="$t('library.import_from_asset_type')"
            @click="importFromAssetType(productionId, entityTypeId)"
          />
          <hr class="mt1" />

          <button-simple
            class="flexrow-item"
            :disabled="!entityIds.length"
            :is-loading="loading"
            :text="$t('library.import_from_list')"
            @click="importFromEntityIds(entityIds)"
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
                  @click="toggleEntity(entity)"
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

<script>
import { mapGetters, mapActions } from 'vuex'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import DeleteEntities from '@/components/tops/actions/DeleteEntities.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'

export default {
  name: 'manage-library',

  components: {
    ButtonSimple,
    Combobox,
    ComboboxProduction,
    DeleteEntities,
    EntityThumbnail
  },

  props: {
    extendable: {
      type: Boolean,
      default: true
    }
  },

  emits: ['library-updated'],

  data() {
    return {
      productionId: null,
      entityTypeId: null,
      entityIds: [],
      loading: false,
      error: false
    }
  },

  async mounted() {
    this.productionId = this.openProductions[0]?.id
    this.$nextTick(() => {
      this.entityTypeId = this.productionEntityTypes[0]?.value
    })
    await this.refresh()
  },

  computed: {
    ...mapGetters([
      'assetTypes',
      'assetTypeMap',
      'openProductions',
      'productionMap',
      'selectedAssets',
      'unsharedAssets'
    ]),

    productionEntityTypes() {
      const production = this.productionMap.get(this.productionId)
      if (!production) return []

      const types = !production.asset_types?.length
        ? this.assetTypes
        : this.assetTypes.filter(type =>
            production.asset_types.includes(type.id)
          )

      return types.map(type => ({ label: type.name, value: type.id }))
    },

    productionUnsharedEntities() {
      return this.unsharedAssets.filter(
        entity =>
          entity.project_id === this.productionId &&
          entity.entity_type_id === this.entityTypeId
      )
    },

    selectedEntities() {
      return [...this.selectedAssets.values()]
    }
  },

  methods: {
    ...mapActions([
      'clearSelectedAssets',
      'loadUnsharedAssets',
      'shareAssets',
      'unshareAssets'
    ]),

    async refresh() {
      this.loading = true
      this.entityIds = []
      const production = this.productionMap.get(this.productionId)
      try {
        await this.loadUnsharedAssets({ production })
      } catch (error) {
        console.error(error)
      }
      this.loading = false
    },

    toggleEntities(entities) {
      const allSelected = entities.every(entity => this.isSelected(entity))
      entities.forEach(entity => this.toggleEntity(entity, !allSelected))
    },

    toggleEntity(entity, force = false) {
      if (force || !this.isSelected(entity)) {
        this.entityIds.push(entity.id)
      } else {
        this.entityIds = this.entityIds.filter(id => id !== entity.id)
      }
    },

    isSelected(entity) {
      return this.entityIds.includes(entity.id)
    },

    async importFromProduction(productionId) {
      this.loading = true
      const production = this.productionMap.get(productionId)
      try {
        await this.shareAssets({ production })
        this.$emit('library-updated')
      } catch (error) {
        console.error(error)
      }
      this.loading = false
      await this.refresh()
    },

    async importFromAssetType(productionId, assetTypeId) {
      this.loading = true
      const production = this.productionMap.get(productionId)
      const assetType = this.assetTypeMap.get(assetTypeId)
      try {
        await this.shareAssets({ production, assetType })
        this.$emit('library-updated')
      } catch (error) {
        console.error(error)
      }
      this.loading = false
      await this.refresh()
    },

    async importFromEntityIds(entityIds) {
      this.loading = true
      try {
        await this.shareAssets({ assetIds: entityIds })
        this.$emit('library-updated')
      } catch (error) {
        console.error(error)
      }
      this.loading = false
      await this.refresh()
    },

    async removeSharedEntities(entities) {
      this.loading = true
      const entityIds = entities.map(entitie => entitie.id)
      try {
        await this.unshareAssets({ assetIds: entityIds })
        this.$emit('library-updated')
        this.clearSelectedAssets()
      } catch (error) {
        console.error(error)
      }
      this.loading = false
      await this.refresh()
    }
  },

  watch: {
    productionId() {
      this.refresh()
    }
  }
}
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
