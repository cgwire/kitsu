<template>
  <div class="entity-search page">
    <form class="search-form" @submit.prevent="onResultSelected">
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
          ref="searchField"
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

<script setup>
/*
 * Page to allow wide search on every entities stored in the open projects.
 */
import { useHead } from '@unhead/vue'
import { SearchIcon } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { getEntityPath } from '@/lib/path'

import Checkbox from '@/components/widgets/Checkbox.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const AVAILABLE_LIMITS = [12, 24, 48]

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State

const isLoading = ref(false)
const isLoadingMoreAssets = ref(false)
const isLoadingMoreShots = ref(false)
const limit = ref(AVAILABLE_LIMITS[0])
const productionId = ref('')
const searchField = ref(null)
const searchQuery = ref('')
const selectedIndex = ref(0)

const limitOptions = AVAILABLE_LIMITS.map(value => ({ label: value, value }))

const results = reactive({ assets: [], shots: [], persons: [] })
const searchFilter = reactive({ assets: true, shots: true, persons: false })

// Computed

const openProductions = computed(() => store.getters.openProductions)
const productionMap = computed(() => store.getters.productionMap)

const flattenResults = computed(() => {
  let values = []
  if (searchFilter.assets) values = values.concat(results.assets)
  if (searchFilter.shots) values = values.concat(results.shots)
  if (searchFilter.persons) values = values.concat(results.persons)
  return values
})

const noSearchFilters = computed(
  () => !searchFilter.assets && !searchFilter.shots
)

const productionList = computed(() => [
  { id: '', name: t('main.all') },
  ...openProductions.value
])

// Functions

const search = () => {
  isLoading.value = true
  const index_names = Object.entries(searchFilter)
    .map(([k, v]) => (v ? k : undefined))
    .filter(Boolean)

  store
    .dispatch('searchData', {
      query: searchQuery.value,
      limit: limit.value,
      productionId: productionId.value,
      index_names
    })
    .then(found => {
      delete found.persons
      Object.assign(results, found)
    })
    .catch(console.error)
    .finally(() => {
      isLoading.value = false
    })
}

const clearSearchResult = () => {
  results.assets = []
  results.shots = []
  results.persons = []
}

const loadMoreResults = indexName => {
  const loadingRef =
    indexName === 'assets' ? isLoadingMoreAssets : isLoadingMoreShots
  loadingRef.value = true

  store
    .dispatch('searchData', {
      query: searchQuery.value,
      limit: limit.value,
      offset: results[indexName].length,
      productionId: productionId.value,
      index_names: [indexName]
    })
    .then(found => {
      results[indexName] = results[indexName].concat(found[indexName])
    })
    .catch(console.error)
    .finally(() => {
      loadingRef.value = false
    })
}

const scrollToSelection = () => {
  const item = flattenResults.value[selectedIndex.value]
  if (item) {
    document.getElementById(`result-link-${item.id}`)?.scrollIntoView(false)
  }
}

const selectPrevious = () => {
  selectedIndex.value--
  if (selectedIndex.value < 0) {
    selectedIndex.value = flattenResults.value.length - 1
  }
  scrollToSelection()
}

const selectNext = () => {
  selectedIndex.value++
  if (selectedIndex.value >= flattenResults.value.length) {
    selectedIndex.value = 0
  }
  scrollToSelection()
}

const selectResultById = id => {
  selectedIndex.value = flattenResults.value.findIndex(item => item.id === id)
}

const onResultSelected = () => {
  const item = flattenResults.value[selectedIndex.value]
  if (item) {
    document.getElementById(`result-link-${item.id}`)?.click()
  }
}

const entityPath = (entity, section) => {
  const project = productionMap.value.get(entity.project_id)
  const isTVShow = project.production_type === 'tvshow'
  let episodeId = null
  if (isTVShow) episodeId = entity.episode_id || 'main'
  return getEntityPath(entity.id, entity.project_id, section, episodeId)
}

const getMatchDetails = entity =>
  t('search.match_details', { target: entity.matched_terms.join(', ') })

const onKeyDown = event => {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.altKey &&
    event.code === 'KeyF'
  ) {
    searchField.value?.focus()
  } else if (event.key === 'ArrowDown') {
    selectNext()
  } else if (event.key === 'ArrowUp') {
    selectPrevious()
  }
}

// Watchers

watch(productionId, search)

watch(searchQuery, () => {
  if (searchQuery.value.length) {
    router.push({ query: { search: searchQuery.value } })
  } else {
    router.push({ query: {} })
  }

  if (searchQuery.value.length > 2) {
    search()
  } else {
    clearSearchResult()
  }

  selectedIndex.value = 0
})

// Lifecycle

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)

  if (route.query.search) {
    searchQuery.value = route.query.search
  }

  searchField.value?.focus()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})

// Head

useHead({ title: computed(() => `${t('search.title')} - Kitsu`) })
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

    @media screen and (max-width: 768px) {
      justify-content: center;
    }
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
