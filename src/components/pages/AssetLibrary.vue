<template>
  <page-layout :side="showSidePanel">
    <template #main>
      <div class="asset-library">
        <header class="flexrow">
          <page-title class="mt1 filler" :text="$t('library.asset_library')" />
        </header>

        <div class="filters flexrow">
          <search-field
            ref="searchFieldRef"
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

<script setup>
import { useHead } from '@unhead/vue'
import { firstBy } from 'thenby'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import PageLayout from '@/components/layouts/PageLayout.vue'
import ManageLibrary from '@/components/sides/ManageLibrary.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

const desktopQuery = window.matchMedia('(min-width: 769px)')
const isDesktop = ref(desktopQuery.matches)
const onMediaChange = event => {
  isDesktop.value = event.matches
}
desktopQuery.addEventListener('change', onMediaChange)

// State

const searchFieldRef = ref(null)

const errors = reactive({ sharedAssets: false })
const loading = reactive({ sharedAssets: false })
const filters = reactive({ productionId: null })
const sorting = reactive({
  current: 'name',
  options: ['name', 'production', 'created_at', 'updated_at'].map(name => ({
    label: name,
    value: name
  }))
})

// Computed

const displayedSharedAssets = computed(
  () => store.getters.displayedSharedAssets
)
const displayedSharedAssetsByType = computed(
  () => store.getters.displayedSharedAssetsByType
)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
// Hide the side panel under the 768px breakpoint — the asset grid takes
// the full width on mobile and the "Add to library" workflow is desktop
// territory anyway.
const showSidePanel = computed(
  () => isCurrentUserManager.value && isDesktop.value
)
const openProductions = computed(() => store.getters.openProductions)
const productionMap = computed(() => store.getters.productionMap)
const selectedAssets = computed(() => store.getters.selectedAssets)

const productionList = computed(() => [
  { name: t('main.all') },
  ...openProductions.value
])

const sortedSharedAssetsByType = computed(() => {
  const nameFilter = (a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true })
  const productionFilter = (a, b) =>
    a.production.name.localeCompare(b.production.name, undefined, {
      numeric: true
    })
  return displayedSharedAssetsByType.value.map(type => {
    if (sorting.current === 'production') {
      return type.sort(firstBy(productionFilter).thenBy(nameFilter))
    }
    if (sorting.current === 'created_at') {
      return type.sort(firstBy('created_at'))
    }
    if (sorting.current === 'updated_at') {
      return type.sort(firstBy('updated_at', -1))
    }
    return type.sort(firstBy(nameFilter).thenBy(productionFilter))
  })
})

// Functions

const setSearchInUrl = query => {
  const searchQuery = query ?? searchFieldRef.value?.getValue()
  router.push({
    query: {
      ...route.query,
      search: searchQuery || undefined
    }
  })
}

const onSearchChange = () => {
  const searchQuery = searchFieldRef.value?.getValue() || ''
  store.dispatch('setSharedAssetSearch', searchQuery)
  setSearchInUrl()
}

const refresh = async (silent = false) => {
  loading.sharedAssets = !silent
  errors.sharedAssets = false
  const production = productionMap.value.get(filters.productionId)
  try {
    await store.dispatch('loadSharedAssets', { production })
  } catch (error) {
    console.error(error)
    errors.sharedAssets = true
  }
  loading.sharedAssets = false
}

const isSelected = entity => selectedAssets.value.has(entity.id)

const toggleEntity = entity => {
  store.dispatch('setAssetSelection', {
    asset: entity,
    selected: !isSelected(entity)
  })
}

const updateRoute = ({ production, search }) => {
  const query = {
    ...route.query,
    production: production || undefined,
    search: search || undefined
  }
  if (JSON.stringify(query) !== JSON.stringify(route.query)) {
    router.push({ query })
  }
}

// Watchers

watch(
  () => filters.productionId,
  value => {
    updateRoute({ production: value })
    refresh()
  }
)

// Lifecycle

onMounted(() => {
  filters.productionId = route.query.production || undefined
  searchFieldRef.value?.setValue(route.query.search || undefined)
  nextTick(onSearchChange)
})

onBeforeUnmount(() => {
  desktopQuery.removeEventListener('change', onMediaChange)
})

// Head

useHead({
  title: computed(() => `${t('library.asset_library')} - Kitsu`)
})
</script>

<style lang="scss" scoped>
.asset-library {
  color: var(--text);
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  max-height: 100%;
  padding: 4em 2em 1em 2em;
}

.filters {
  flex-wrap: wrap;
  gap: 0.5em;

  > .flexrow-item {
    margin-right: 0;
  }
}

.entities {
  .items {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    // The global `ul { margin-left: 1em }` rule shifts the row right and
    // breaks `justify-content: center`. Reset it here.
    margin-left: 0;
    padding-left: 0;
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

@media screen and (max-width: 768px) {
  .asset-library {
    padding: 4.5em 0.75em 1em;
  }

  // Drop the mt1 utility on the page title so the heading hugs the page
  // top padding instead of stacking another 1em on top.
  header {
    margin-bottom: 1em;

    :deep(.page-title) {
      margin-top: 0;
    }
  }

  .filters {
    gap: 0.75em;
    margin-bottom: 1em;

    // Stretch each filter to the full width so they stack cleanly when
    // wrapped; the spacer between them collapses to nothing.
    > .flexrow-item {
      flex: 1 1 100%;
    }

    > .filler {
      display: none;
    }

    // ComboboxProduction / Combobox wrap themselves in a global .field
    // (margin-bottom: 2em) that compounds with the row gap. SearchField
    // doesn't, so the stacked spacing reads as tight above the
    // production combobox and loose below it. Reset the bottom margin
    // and let `gap` alone drive the rhythm.
    :deep(.field) {
      margin-bottom: 0;
    }
  }

  .entities {
    .items {
      gap: 12px;
      justify-content: center;
    }
  }
}
</style>
