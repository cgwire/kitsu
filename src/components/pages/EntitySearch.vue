<template>
  <div class="entity-search page">
    <form class="search-form" @submit.prevent="onResultSelected()">
      <div>
        <combobox-production
          class="flexrow-item production-field"
          :label="$t('main.production')"
          :production-list="productionList"
          v-model="productionId"
        />
      </div>

      <div class="search-field">
        <span class="search-icon">
          <search-icon :size="20" />
        </span>
        <input
          ref="search-field"
          class="input"
          :placeholder="$t('search.placeholder')"
          v-model.trim="searchQuery"
        />
      </div>
      <div class="search-options pa1 flexrow">
        <checkbox
          class="flexrow-item"
          :toggle="true"
          :label="$t('assets.title')"
          @change="search"
          v-model="searchFilter.assets"
        />
        <checkbox
          class="flexrow-item"
          :toggle="true"
          :label="$t('shots.title')"
          @change="search"
          v-model="searchFilter.shots"
        />

        <div class="filler"></div>
        <span class="flexrow-item no-margin">
          {{ $t('search.limit') }}
        </span>
        <combobox
          class="search-limit flexrow-item"
          :options="limitOptions"
          :with-margin="false"
          @update:model-value="search"
          v-model="limit"
        />
      </div>
    </form>
    <div class="search-results mb2">
      <div class="has-text-centered" v-if="searchQuery.length < 3">
        {{ $t('main.search.type') }}
      </div>
      <div class="has-text-centered" v-else-if="noSearchFilters">
        {{ $t('main.search.no_filter') }}
      </div>
      <div v-else-if="isLoading">
        <spinner />
      </div>
      <div v-else>
        <div class="pb1" v-if="searchFilter.assets">
          <h2 class="mt0">
            {{ $t('assets.title') }} ({{ results.assets?.length || 0 }})
          </h2>
          <div class="has-text-centered" v-if="!results.assets?.length">
            {{ $t('main.search.no_result') }}
          </div>
          <div class="result-list" v-else>
            <div
              class="result flexcolumn"
              :class="{
                'selected-result': flattenResults[selectedIndex] === entity
              }"
              :key="entity.id"
              @mouseover="selectResultById(entity.id)"
              v-for="entity in results.assets"
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
                :to="entityPath(entity, 'asset')"
              >
                <div class="production-name">
                  {{ entity.project_name }}
                </div>
                <div class="entity-name">
                  {{ entity.asset_type_name }} / {{ entity.name }}
                </div>
                <div class="match">
                  <span class="match-icon">
                    <search-icon :size="15" />
                  </span>
                  {{ getMatchDetails(entity) }}
                </div>
              </router-link>
            </div>
          </div>
          <p
            class="has-text-centered mt2"
            v-if="
              results.assets.length !== 0 && results.assets.length % 12 === 0
            "
          >
            <button
              class="button is-link"
              @click="loadMoreResults('assets')"
              v-if="!isLoadingMoreAssets"
            >
              {{ $t('main.load_more') }}
            </button>
            <spinner v-else />
          </p>
        </div>
        <div class="pb1" v-if="searchFilter.shots">
          <h2 class="mt1">
            {{ $t('shots.title') }} ({{ results.shots?.length || 0 }})
          </h2>
          <div class="has-text-centered" v-if="!results.shots?.length">
            {{ $t('main.search.no_result') }}
          </div>
          <div class="result-list" v-else>
            <div
              class="result flexcolumn"
              :class="{
                'selected-result': flattenResults[selectedIndex] === entity
              }"
              :key="entity.id"
              @mouseover="selectResultById(entity.id)"
              v-for="entity in results.shots"
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
                :to="entityPath(entity, 'shot')"
              >
                <div class="production-name">
                  {{ entity.project_name }}
                </div>
                <div class="entity-name">
                  <template v-if="entity.episode_name">
                    {{ entity.episode_name }} /
                  </template>
                  {{ entity.sequence_name }} / {{ entity.name }}
                </div>
                <div class="match">
                  <span class="match-icon">
                    <search-icon :size="15" />
                  </span>
                  <span class="match-details">{{
                    getMatchDetails(entity)
                  }}</span>
                </div>
              </router-link>
            </div>
          </div>
          <p
            class="has-text-centered mt2"
            v-if="results.shots.length !== 0 && results.shots.length % 12 === 0"
          >
            <button
              class="button is-link"
              @click="loadMoreResults('shots')"
              v-if="!isLoadingMoreShots"
            >
              {{ $t('main.load_more') }}
            </button>
            <spinner v-else />
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*
 * Page to allow wide search on every entities stored in the open projects.
 */
import { mapGetters, mapActions } from 'vuex'
import { getEntityPath, getPersonPath } from '@/lib/path'

import { SearchIcon } from 'lucide-vue-next'
import stringHelpers from '@/lib/string'

import Checkbox from '@/components/widgets/Checkbox.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const AVAILABLE_LIMITS = [12, 24, 48]

export default {
  name: 'entity-search',

  components: {
    Checkbox,
    Combobox,
    ComboboxProduction,
    EntityPreview,
    SearchIcon,
    Spinner
  },

  data() {
    return {
      isLoading: false,
      isLoadingMoreAssets: false,
      isLoadingMoreShots: false,
      limit: AVAILABLE_LIMITS[0],
      limitOptions: AVAILABLE_LIMITS.map(value => ({ label: value, value })),
      productionId: '',
      selectedIndex: 0,
      searchQuery: '',
      searchFilter: {
        assets: true,
        shots: true,
        persons: false
      },
      results: {
        assets: [],
        shots: [],
        persons: []
      }
    }
  },

  mounted() {
    window.addEventListener('keydown', this.onKeyDown)

    if (this.$route.query.search) {
      this.searchQuery = this.$route.query.search
    }

    this.searchField.focus()
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  computed: {
    ...mapGetters(['openProductions', 'productionMap']),

    searchField() {
      return this.$refs['search-field']
    },

    flattenResults() {
      let values = []
      if (this.searchFilter.assets) {
        values = values.concat(this.results.assets)
      }
      if (this.searchFilter.shots) {
        values = values.concat(this.results.shots)
      }
      if (this.searchFilter.persons) {
        values = values.concat(this.results.persons)
      }
      return values
    },

    noSearchFilters() {
      return (
        !this.searchFilter.assets && !this.searchFilter.shots
        // && !this.searchFilter.persons
      )
    },

    productionList() {
      return [
        {
          id: '',
          name: this.$t('main.all')
        }
      ].concat([...this.openProductions])
    }
  },

  methods: {
    ...mapActions(['searchData']),

    onKeyDown(event) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.altKey &&
        event.code === 'KeyF'
      ) {
        this.searchField?.focus()
      } else if (event.key === 'ArrowDown') {
        this.selectNext()
      } else if (event.key === 'ArrowUp') {
        this.selectPrevious()
      }
    },

    search() {
      this.isLoading = true
      const index_names = Object.entries(this.searchFilter)
        .map(([k, v]) => (v ? k : undefined))
        .filter(Boolean)

      this.searchData({
        query: this.searchQuery,
        limit: this.limit,
        productionId: this.productionId,
        index_names
      })
        .then(results => {
          delete results.persons
          this.results = results
        })
        .catch(console.error)
        .finally(() => {
          this.isLoading = false
        })
    },

    loadMoreResults(indexName) {
      const index_names = [indexName]
      const loadingField = `isLoadingMore${stringHelpers.capitalize(indexName)}`
      this[loadingField] = true

      this.searchData({
        query: this.searchQuery,
        limit: this.limit,
        offset: this.results[indexName].length,
        productionId: this.productionId,
        index_names
      })
        .then(results => {
          this.results[indexName] = this.results[indexName].concat(
            results[indexName]
          )
        })
        .catch(console.error)
        .finally(() => {
          this[loadingField] = false
        })
    },

    selectPrevious() {
      this.selectedIndex--
      if (this.selectedIndex < 0) {
        this.selectedIndex = this.flattenResults.length - 1
      }
      this.scrollToSelection()
    },

    selectNext() {
      this.selectedIndex++
      if (this.selectedIndex >= this.flattenResults.length) {
        this.selectedIndex = 0
      }
      this.scrollToSelection()
    },

    scrollToSelection() {
      const item = this.flattenResults[this.selectedIndex]
      if (item) {
        document.getElementById(`result-link-${item.id}`)?.scrollIntoView(false)
      }
    },

    selectResultById(id) {
      this.selectedIndex = this.flattenResults.findIndex(item => item.id === id)
    },

    onResultSelected() {
      const item = this.flattenResults[this.selectedIndex]
      if (item) {
        document.getElementById(`result-link-${item.id}`)?.click()
      }
    },

    clearSearchResult() {
      this.results = {
        assets: [],
        shots: [],
        persons: []
      }
    },

    entityPath(entity, section) {
      const project = this.productionMap.get(entity.project_id)
      const isTVShow = project.production_type === 'tvshow'
      let episodeId = null
      if (isTVShow) episodeId = entity.episode_id || 'main'
      return getEntityPath(entity.id, entity.project_id, section, episodeId)
    },

    personPath(person) {
      return getPersonPath(person.id)
    },

    getMatchDetails(entity) {
      const target = entity.matched_terms.join(', ')
      return this.$t('search.match_details', {
        target
      })
    }
  },

  watch: {
    productionId() {
      this.search()
    },

    searchQuery() {
      if (this.searchQuery.length) {
        this.$router.push({ query: { search: this.searchQuery } })
      } else {
        this.$router.push({ query: {} })
      }

      if (this.searchQuery.length > 2) {
        this.search()
      } else {
        this.clearSearchResult()
      }

      this.selectedIndex = 0
    }
  },

  head() {
    return {
      title: `${this.$t('search.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.mt0 {
  margin-top: 0;
}

.search-form {
  max-width: 800px;
  margin: auto;
}

.search-field {
  padding-top: 0;
  position: relative;
  width: 100%;

  .input {
    font-size: 1.3em;
    border-radius: 10px;
    padding-left: 40px;
  }

  .search-icon {
    position: absolute;
    color: $grey;
    z-index: 4;
    top: 17px;
    left: 10px;
  }
}

.production-field {
  margin-bottom: 1em;
  margin-top: 1em;
}

.search-options {
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0 2em;

  .search-filter {
    gap: 2em;
  }

  .search-limit {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
  }
}

.search-results {
  max-width: 1260px; // 300px * 4 + gap * 3
  margin-left: auto;
  margin-right: auto;

  .result-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .result {
    height: 300px;
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

      .production-name {
        font-size: 0.9em;
        text-transform: uppercase;
        font-weight: 500;
        color: var(--text);
      }
    }

    .match {
      display: inline-flex;
      color: var(--text-alt);
      font-weight: normal;
      margin-top: 0.5em;
      opacity: 0.7;

      .match-icon {
        margin-top: 2px;
        margin-right: 0.5em;
      }
    }
  }
}
</style>
