<template>
  <page-layout :side="isCurrentUserManager">
    <template #main>
      <div class="asset-library">
        <header class="flexrow">
          <page-title class="mt1 filler" :text="$t('library.asset_library')" />
        </header>

        <div class="filters flexrow">
          <search-field
            ref="search-field"
            class="flexrow-item"
            @change="onSearchChange"
            :can-save="false"
            v-focus
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
          <div
            class="has-text-centered"
            v-else-if="!displayedSharedAssets.length"
          >
            {{ $t('library.no_shared_assets') }}
          </div>
          <template v-else>
            <div
              class="pb1"
              :key="index"
              v-for="(group, index) in sortedSharedAssetsByType"
            >
              <h2 class="mt0">
                {{ group[0].asset_type_name }} ({{ group.length }})
              </h2>
              <ul class="items">
                <li
                  class="item flexcolumn"
                  :class="{
                    'selectable-item': isCurrentUserManager,
                    'selected-item': isSelected(entity)
                  }"
                  :key="entity.id"
                  @click="isCurrentUserManager && toggleEntity(entity)"
                  v-for="entity in group"
                >
                  <div class="card" :title="entity.full_name">
                    <entity-preview
                      :empty-height="100"
                      :empty-width="150"
                      :height="100"
                      :width="150"
                      :entity="entity"
                      is-rounded-top-border
                    />
                    <div class="item-description flexrow">
                      <production-name
                        class="flexrow-item mr0"
                        :production="entity.production"
                        :size="20"
                        only-avatar
                      />
                      <div class="entity-name ml1 flexrow-item">
                        {{ entity.name }}
                      </div>
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
import { firstBy } from 'thenby'
import { mapGetters, mapActions } from 'vuex'

import { searchMixin } from '@/components/mixins/search'

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

  mixins: [searchMixin],

  components: {
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
    this.$nextTick(() => {
      this.onSearchChange()
    })
  },

  computed: {
    ...mapGetters([
      'displayedSharedAssets',
      'displayedSharedAssetsByType',
      'isCurrentUserManager',
      'openProductions',
      'productionMap',
      'selectedAssets'
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
      return this.displayedSharedAssetsByType.map(type => {
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
    }
  },

  methods: {
    ...mapActions([
      'loadSharedAssets',
      'setAssetSelection',
      'setSharedAssetSearch'
    ]),

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
      this.setSharedAssetSearch(searchQuery)
      this.setSearchInUrl()
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

  head() {
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
  padding: 4em 2em 1em 2em;
  color: var(--text);
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
    height: fit-content;
    transition: border-color 0.2s ease-in-out;

    &.selectable-item {
      cursor: pointer;

      &:hover {
        border-color: var(--background-selectable);
      }
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
      color: var(--text-strong);
      font-size: 0.9em;
      font-weight: bold;
      max-width: 150px;
      min-width: 150px;
      padding: 0.5em;

      .entity-name {
        margin-left: 0.5em;
        word-break: break-word;
      }
    }
  }
}
</style>
