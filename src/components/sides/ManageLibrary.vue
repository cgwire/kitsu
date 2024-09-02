<template>
  <div class="side-wrapper">
    <div
      class="extend-bar"
      @mousedown.prevent="/* onExtendDown */"
      @touchstart.prevent="/* onExtendDown */"
      v-if="extendable"
    ></div>
    <div class="side manage-library">
      <h2 class="mt0">{{ $t('library.manage') }}</h2>
      <div class="flexrowcolumn" v-if="selectedEntities.length">
        <delete-entities
          :error-text="$t('assets.multiple_delete_error')"
          :is-loading="loading"
          :is-error="error"
          :text="
            $tc('library.remove_selected_assets', selectedEntities.length, {
              nbSelectedEntities: selectedEntities.length
            })
          "
          @confirm="removeSharedEntities(selectedEntities)"
        />
        <div class="has-text-centered pa1">
          <a @click="clearSelectedAssets()">{{ $t('main.clear_selection') }}</a>
        </div>
        <h1 class="title mt05">{{ $tc('tasks.selected_entities') }}</h1>
        <div class="pa2 mt1">
          <div
            class="entity-line"
            :key="entity.id"
            v-for="entity in selectedEntities"
          >
            {{ entity.full_name }}
          </div>
        </div>
      </div>

      <template v-else>
        <div class="flexcolumn mt2">
          <combobox-production
            class="flexrow-item"
            :label="$t('library.import_from_production')"
            :production-list="openProductions"
            :with-margin="false"
            v-model="productionId"
          />
          <button-simple
            class="flexrow-item mt05"
            :disabled="!productionId"
            :is-loading="loading"
            :text="$t('main.import')"
            @click="importFromProduction(productionId)"
          />
        </div>
        <div class="flexcolumn mt2">
          <combobox
            class="flexrow-item"
            :disabled="!productionId"
            :label="$t('library.import_from_asset_type')"
            :options="productionEntityTypes"
            :with-margin="false"
            v-model="entityTypeId"
          />
          <button-simple
            class="flexrow-item mt05"
            :disabled="!productionId"
            :is-loading="loading"
            :text="$t('main.import')"
            @click="importFromAssetType(productionId, entityTypeId)"
          />
        </div>
        <div class="flexcolumn mt2">
          <label class="label">
            {{ $t('library.import_from_assets') }}
          </label>
          <div class="mt1" v-if="!unsharedAssets.length">
            {{ $t('library.no_more_entities') }}
          </div>
          <div class="unshared-entities" v-else>
            <table
              class="datatable multi-section"
              v-for="(group, index) in unsharedAssetsByType"
              :key="index"
            >
              <tr class="datatable-type-header">
                <th>
                  <span
                    class="datatable-row-header pointer"
                    @click="toggleEntities(group)"
                  >
                    {{ group[0]?.asset_type_name }}
                  </span>
                </th>
              </tr>

              <tr
                class="datatable-row"
                :key="entity.id"
                v-for="entity in group"
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
                    <span class="entity-name">
                      {{ entity.name }}
                    </span>
                  </div>
                </td>
              </tr>
            </table>
          </div>
          <button-simple
            class="flexrow-item mt2"
            :disabled="!entityIds.length"
            :is-loading="loading"
            :text="$t('main.import')"
            @click="importFromEntityIds(entityIds)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

// import { domMixin } from '@/components/mixins/dom'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import DeleteEntities from '@/components/tops/actions/DeleteEntities.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'

// const DEFAULT_PANEL_WIDTH = 400

export default {
  name: 'manage-library',

  // mixins: [domMixin],

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

  data() {
    return {
      productionId: null,
      entityTypeId: null,
      entityIds: [],
      loading: false,
      error: false
      // domEvents: [
      //   ['mousemove', this.onExtendMove],
      //   ['touchmove', this.onExtendMove],
      //   ['mouseup', this.onExtendUp],
      //   ['mouseleave', this.onExtendUp],
      //   ['touchend', this.onExtendUp],
      //   ['touchcancel', this.onExtendUp]
      // ],
    }
  },

  async mounted() {
    // if (this.sideColumnParent) {
    //   const panelWidth =
    //     preferences.getIntPreference('task:panel-width') || DEFAULT_PANEL_WIDTH
    //   this.setWidth(panelWidth)
    // }

    this.productionId = this.openProductions[0]?.id

    await this.refresh()
  },

  beforeDestroy() {
    // this.removeEvents(this.domEvents)
  },

  computed: {
    ...mapGetters([
      'assetTypes',
      'assetTypeMap',
      'openProductions',
      'productionMap',
      'selectedAssets',
      'unsharedAssets',
      'unsharedAssetsByType'
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

    selectedEntities() {
      return [...this.selectedAssets.values()]
    }

    // sideColumnParent() {
    //   if (this.$el.parentElement.classList.contains('side-column')) {
    //     return this.$el.parentElement
    //   }
    //   return undefined
    // },
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
      try {
        await this.loadUnsharedAssets({ production: null })
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

    /*
    onExtendDown(event) {
      // if (!this.sideColumnParent) {
      //   return
      // }
      this.lastWidthX = this.getClientX(event)
      const panelWidth = this.sideColumnParent.offsetWidth
      this.lastWidth = panelWidth
      this.addEvents(this.domEvents)
    },

    onExtendMove(event) {
      const diff = this.lastWidthX - this.getClientX(event)
      let panelWidth = Math.max(this.lastWidth + diff, DEFAULT_PANEL_WIDTH)
      if (panelWidth > 900) panelWidth = 900
      this.setWidth(panelWidth)
      this.refreshPreviewPlay()
    },

    onExtendUp() {
      this.removeEvents(this.domEvents)
      this.refreshPreviewPlay()
      // if (this.sideColumnParent) {
      const panelWidth = this.sideColumnParent.offsetWidth
      preferences.setPreference('task:panel-width', panelWidth)
      // }
    },

    setWidth(width) {
      // if (!this.sideColumnParent) {
      //   return
      // }
      this.sideColumnParent.style['min-width'] = `${width}px`
      this.isWide = width > 699
      this.isExtraWide = width >= 900
    }
    */
  },

  watch: {
    // productionId() {
    //   this.refresh()
    // }
  },

  socket: {
    events: {
      // 'asset:update'(eventData) {
      //   this.refresh()
      // }
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
  // cursor: ew-resize;
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
