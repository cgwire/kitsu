<template>
  <page-layout :side="openedSidePanel">
    <template #main>
      <div class="asset-library">
        <header class="flexrow">
          <page-title class="mt1 filler" :text="$t('library.asset_library')" />
          <button-simple
            class="button"
            icon="plus"
            :text="$t('library.manage')"
            @click="openedSidePanel = !openedSidePanel"
          />
        </header>

        <pre>{{ filteredAssetList.length }}</pre>

        <div class="filters flexrow">
          <search-field
            ref="search-field"
            class="flexrow-item"
            @change="onSearchChange"
            @save="/* saveSearchQuery */"
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
            locale-key-prefix="tasks.fields."
            v-model="sorting.current"
          />
        </div>

        <!--
        <div class="query-list">
          <search-query-list
            :queries="searchQueries"
            type="library"
            @change-search="changeSearch"
            @remove-search="removeSearchQuery"
          />
        </div>
        -->

        <div class="entities mb2">
          <table-info
            :is-loading="loading.sharedAssets"
            :is-error="errors.sharedAssets"
            v-if="loading.sharedAssets || errors.sharedAssets"
          />
          <div class="has-text-centered" v-else-if="!filteredAssetList.length">
            {{ $t('library.no_shared_assets') }}
          </div>
          <template v-else>
            <div
              class="pb1"
              v-for="(group, index) in groupedAssetList"
              :key="index"
            >
              <h2 class="mt0">
                {{ group[0].asset_type_name }} ({{ group.length }})
              </h2>
              <div class="result-list">
                <div
                  class="result flexcolumn"
                  :key="entity.id"
                  v-for="entity in filteredAssetList"
                >
                  <entity-preview
                    :empty-height="200"
                    :empty-width="300"
                    :height="200"
                    :width="300"
                    :entity="entity"
                    is-rounded-top-border
                  />
                  <router-link
                    class="result-description"
                    :id="`result-link-${entity.id}`"
                    :to="getEntityPath(entity.id, entity.project_id, 'asset')"
                  >
                    <div class="entity-name mt05">
                      {{ entity.asset_type_name }} / {{ entity.name }}
                    </div>
                    <production-name
                      class="mt05"
                      :production="{
                        id: entity.project_id,
                        name: entity.project_name
                      }"
                    />
                  </router-link>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
    <template #side>
      <task-info entity-type="shared-asset" />
    </template>
  </page-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getEntityPath } from '@/lib/path'

// import { searchMixin } from '@/components/mixins/search'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import PageLayout from '@/components/layouts/PageLayout.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'
import SearchField from '@/components/widgets/SearchField.vue'
// import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'

export default {
  name: 'asset-library',

  // mixins: [searchMixin],

  components: {
    ButtonSimple,
    Combobox,
    ComboboxProduction,
    EntityPreview,
    PageLayout,
    PageTitle,
    ProductionName,
    SearchField,
    // SearchQueryList,
    TableInfo,
    TaskInfo
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
        current: 'entity_name',
        options: ['entity_name'].map(name => ({ label: name, value: name }))
      }
    }
  },

  mounted() {
    this.filters.productionId = this.$route.query.production || undefined
    this.searchField.setValue(this.$route.query.search || undefined)
  },

  computed: {
    ...mapGetters(['openProductions', 'sharedAssets']),

    searchField() {
      return this.$refs['search-field']
    },

    productionList() {
      return [{ name: this.$t('main.all') }, ...this.openProductions]
    },

    filteredAssetList() {
      if (this.filters.productionId) {
        return this.sharedAssets.filter(
          asset => asset.project_id === this.filters.productionId
        )
      }
      return this.sharedAssets
    },

    groupedAssetList() {
      return this.filteredAssetList.reduce((acc, asset) => {
        if (!acc[asset.asset_type_id]) {
          acc[asset.asset_type_id] = []
        }
        acc[asset.asset_type_id].push(asset)
        return acc
      }, {})
    }
  },

  methods: {
    ...mapActions(['loadSharedAssets']),

    getEntityPath,

    async reset() {
      this.loading.sharedAssets = true
      try {
        await this.loadSharedAssets()
      } catch (err) {
        console.error(err)
        this.errors.sharedAssets = true
      }
      this.loading.sharedAssets = false
    },

    onSearchChange() {
      const searchQuery = this.searchField.getValue() || ''
      if (searchQuery?.length !== 1) {
        // TODO: module action
        // this.setSharedAssetSearch(searchQuery)
      }
      this.updateRoute({ search: searchQuery })
    },

    // saveSearchQuery(searchQuery) {
    //   if (this.loading.savingSearch) {
    //     return
    //   }
    //   this.loading.savingSearch = true
    //   this.saveSharedAssetSearch(searchQuery)
    //     .catch(console.error)
    //     .finally(() => {
    //       this.loading.savingSearch = false
    //     })
    // },

    // removeSearchQuery(searchQuery) {
    //   this.removeSharedAssetSearch(searchQuery).catch(err => {
    //     if (err) console.error(err)
    //   })
    // }

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
    },

    currentProduction: {
      immediate: true,
      handler() {
        this.reset()
      }
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
  .result-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .result {
    // height: 300px;
    background: var(--background);
    border-radius: 1em;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);

    .dark & {
      background: var(--background-alt);
    }

    &.selected-result {
      background: var(--background-hover);
    }

    .result-description {
      max-width: 300px;
      color: var(--text-strong);
      font-weight: bold;
      padding: 0.3em 1em;
    }
  }
}
</style>
