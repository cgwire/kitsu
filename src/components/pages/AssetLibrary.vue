<template>
  <page-layout :side="openedSidePanel || hasSelectedAssets">
    <template #main>
      <div class="asset-library">
        <header class="flexrow">
          <page-title class="mt1 filler" :text="$t('library.asset_library')" />
          <button-simple
            class="button"
            :disabled="hasSelectedAssets"
            icon="plus"
            :text="$t('library.manage')"
            @click="openedSidePanel = !openedSidePanel"
          />
        </header>

        <div class="filters flexrow">
          <search-field
            ref="search-field"
            class="flexrow-item"
            @change="onSearchChange"
            :can-save="false"
            v-focus
            v-show="false"
          />
          <combobox-production
            class="flexrow-item"
            :label="$t('main.production')"
            :production-list="productionList"
            v-model="filters.productionId"
          />
          <span class="filler"></span>
          <combobox
            class="flexrow-item"
            :label="$t('main.sorted_by')"
            :options="sorting.options"
            locale-key-prefix="library.fields."
            v-model="sorting.current"
          />
        </div>

        <div class="entities mb2">
          <table-info
            :is-loading="loading.sharedAssets"
            :is-error="errors.sharedAssets"
            v-if="loading.sharedAssets || errors.sharedAssets"
          />
          <div class="has-text-centered" v-else-if="!sharedAssets.length">
            {{ $t('library.no_shared_assets') }}
          </div>
          <template v-else>
            <div
              class="pb1"
              v-for="(group, index) in sortedSharedAssetsByType"
              :key="index"
            >
              <h2 class="mt0">
                {{ group[0].asset_type_name }} ({{ group.length }})
              </h2>
              <ul class="items">
                <li
                  class="item flexcolumn"
                  :class="{
                    'selected-item': isSelected(entity)
                  }"
                  :key="entity.id"
                  v-for="entity in group"
                  @click="toggleEntity(entity)"
                >
                  <div class="card">
                    <entity-preview
                      :empty-height="200"
                      :empty-width="300"
                      :height="200"
                      :width="300"
                      :entity="entity"
                      is-rounded-top-border
                    />
                    <div class="item-description">
                      <div class="entity-name mt05">
                        {{ entity.full_name }}
                      </div>
                      <production-name
                        class="mt05"
                        :production="entity.production"
                      />
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </template>
    <template #side>
      <manage-library @library-updated="refresh(true)" />
    </template>
  </page-layout>
</template>

<script>
import firstBy from 'thenby'
import { mapGetters, mapActions } from 'vuex'

// import { searchMixin } from '@/components/mixins/search'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import ManageLibrary from '@/components/sides/ManageLibrary.vue'
import PageLayout from '@/components/layouts/PageLayout.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

export default {
  name: 'asset-library',

  // mixins: [searchMixin],

  components: {
    ButtonSimple,
    Combobox,
    ComboboxProduction,
    EntityPreview,
    ManageLibrary,
    PageLayout,
    PageTitle,
    ProductionName,
    SearchField,
    TableInfo
  },

  data() {
    return {
      openedSidePanel: false,
      errors: {
        sharedAssets: false
      },
      filters: {
        productionId: null
      },
      loading: {
        sharedAssets: false
      },
      sorting: {
        current: 'name',
        options: ['name', 'production', 'created_at', 'updated_at'].map(
          name => ({
            label: name,
            value: name
          })
        )
      }
    }
  },

  mounted() {
    this.filters.productionId = this.$route.query.production || undefined
    this.searchField.setValue(this.$route.query.search || undefined)
  },

  computed: {
    ...mapGetters([
      'openProductions',
      'productionMap',
      'selectedAssets',
      'sharedAssets',
      'sharedAssetsByType'
    ]),

    searchField() {
      return this.$refs['search-field']
    },

    productionList() {
      return [{ name: this.$t('main.all') }, ...this.openProductions]
    },

    sortedSharedAssetsByType() {
      const nameFilter = (a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      const productionFilter = (a, b) =>
        a.production.name.localeCompare(b.production.name, undefined, {
          numeric: true
        })
      return this.sharedAssetsByType.map(type => {
        if (this.sorting.current === 'production') {
          return type.sort(firstBy(productionFilter).thenBy(nameFilter))
        }
        if (this.sorting.current === 'created_at') {
          return type.sort(firstBy('created_at'))
        }
        if (this.sorting.current === 'updated_at') {
          return type.sort(firstBy('updated_at', -1))
        }
        return type.sort(firstBy(nameFilter).thenBy(productionFilter))
      })
    },

    hasSelectedAssets() {
      return this.selectedAssets.size > 0
    }
  },

  methods: {
    ...mapActions(['loadSharedAssets', 'setAssetSelection']),

    async refresh(silent = false) {
      this.loading.sharedAssets = !silent
      const production = this.productionMap.get(this.filters.productionId)
      try {
        await this.loadSharedAssets({ production })
      } catch (error) {
        console.error(error)
        this.errors.sharedAssets = true
      }
      this.loading.sharedAssets = false
    },

    toggleEntity(entity) {
      const selected = this.isSelected(entity)
      this.setAssetSelection({ asset: entity, selected: !selected })
    },

    isSelected(entity) {
      return this.selectedAssets.has(entity.id)
    },

    onSearchChange() {
      const searchQuery = this.searchField.getValue() || ''
      if (searchQuery?.length !== 1) {
        // TODO: module action
        // this.setSharedAssetSearch(searchQuery)
      }
      this.updateRoute({ search: searchQuery })
    },

    updateRoute({ production, search }) {
      const query = {
        ...this.$route.query,
        production: production || undefined,
        search: search || undefined
      }

      if (JSON.stringify(query) !== JSON.stringify(this.$route.query)) {
        this.$router.push({ query })
      }
    }
  },

  watch: {
    'filters.productionId'(value) {
      this.updateRoute({ production: value })
      this.refresh()
    }
  },

  metaInfo() {
    return {
      title: `${this.$t('library.asset_library')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-library {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  padding: 4em 1em 1em 1em;
  color: var(--text);
  max-width: calc(1260px + 2em); // (300px * 4 + gap * 3) + padding * 2
  margin-left: auto;
  margin-right: auto;
}

.entities {
  .items {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .item {
    background-color: var(--background);
    border: 5px solid transparent;
    border-radius: 1em;
    transition: border-color 0.2s ease-in-out;
    cursor: pointer;

    &:hover {
      border-color: var(--background-selectable);
    }

    &.selected-item {
      border-color: var(--background-selected);
    }

    .card {
      border-radius: inherit;
      box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);

      .dark & {
        background-color: var(--background-alt);
      }
    }

    .item-description {
      max-width: 300px;
      color: var(--text-strong);
      font-weight: bold;
      padding: 0.3em 1em;
    }
  }
}
</style>
