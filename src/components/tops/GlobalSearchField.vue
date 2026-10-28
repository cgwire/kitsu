<template>
  <div class="global-search-field">
    <span class="search-icon">
      <search-icon :size="20" />
    </span>
    <input
      ref="searchInput"
      class="input"
      placeholder="ctrl+alt+f"
      @focus="isSearchActive = true"
      @blur="onBlur"
      @keyup.enter="onElementSelected"
      v-model.trim="searchQuery"
    />
    <div
      class="search-results"
      :style="{
        'min-height': `${(nbResults || 1) * 60}px`
      }"
      @mousedown.prevent
      v-if="isSearchActive"
    >
      <div class="result-line" v-if="searchQuery.length < 3">
        {{ $t('main.search.type') }}
      </div>
      <div class="search-loader" v-else-if="isLoading">
        <spinner />
      </div>
      <div v-else-if="nbResults > 0">
        <div
          :key="asset.id"
          :class="{
            'result-line': true,
            'selected-result': selectedIndex === index
          }"
          @click="onElementSelected"
          v-for="(asset, index) in assets"
        >
          <router-link
            :id="`result-link-${index}`"
            :to="entityPath(asset, 'asset')"
          >
            <div class="flexrow" @mouseover="selectedIndex = index">
              <div class="flexrow-item">
                <entity-thumbnail
                  style="margin-top: 5px"
                  :empty-height="40"
                  :empty-width="60"
                  :height="40"
                  :width="60"
                  :entity="asset"
                  :with-link="false"
                />
              </div>
              <div class="flexrow-item">
                <div class="production-name">
                  {{ asset.project_name }}
                </div>
                <div class="asset-type-name">
                  {{ asset.asset_type_name }} / {{ asset.name }}
                </div>
              </div>
            </div>
          </router-link>
        </div>
        <div
          :key="shot.id"
          :class="{
            'result-line': true,
            'selected-result': selectedIndex === index + assets.length
          }"
          @click="onElementSelected"
          v-for="(shot, index) in shots"
        >
          <router-link
            :id="`result-link-${index + assets.length}`"
            :to="entityPath(shot, 'shot')"
          >
            <div
              class="flexrow"
              @mouseover="selectedIndex = index + assets.length"
            >
              <div class="flexrow-item">
                <entity-thumbnail
                  style="margin-top: 5px"
                  :empty-height="40"
                  :empty-width="60"
                  :height="40"
                  :width="60"
                  :entity="shot"
                  :with-link="false"
                />
              </div>
              <div class="flexrow-item">
                <div class="production-name">
                  {{ shot.project_name }}
                </div>
                <div class="shot-type-name">
                  <template v-if="shot.episode_name">
                    {{ shot.episode_name }} /
                  </template>
                  {{ shot.sequence_name }} / {{ shot.name }}
                </div>
              </div>
            </div>
          </router-link>
        </div>
        <div
          :key="person.id"
          :class="{
            'result-line': true,
            'selected-result':
              selectedIndex === index + assets.length + shots.length
          }"
          @click="onElementSelected"
          v-for="(person, index) in persons"
        >
          <router-link
            :id="`result-link-${index + assets.length + shots.length}`"
            :to="personPath(person)"
          >
            <div
              class="flexrow"
              @mouseover="selectedIndex = index + assets.length + shots.length"
            >
              <people-avatar
                class="flexrow-item"
                :is-link="false"
                :person="person"
              />
              <people-name class="flexrow-item" :person="person" />
            </div>
          </router-link>
        </div>
      </div>
      <div class="result-line" v-else>
        {{ $t('main.search.no_result') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { SearchIcon } from 'lucide-vue-next'
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useStore } from 'vuex'

import {
  exitDocumentFullScreen,
  useFullScreenElement
} from '@/composables/fullScreen'
import { isSearchShortcut } from '@/lib/keyboard'
import { getEntityPath, getPersonPath } from '@/lib/path'
import peopleStore from '@/store/modules/people'

import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import Spinner from '@/components/widgets/Spinner.vue'

// Composables
// --------------------------------------------------------------------------

const store = useStore()
const fullScreenElement = useFullScreenElement()

// State
// --------------------------------------------------------------------------

const searchInput = useTemplateRef('searchInput')

const assets = ref([])
const isFocusPending = ref(false)
const isLoading = ref(false)
const isSearchActive = ref(false)
const persons = ref([])
const searchQuery = ref('')
const selectedIndex = ref(0)
const shots = ref([])

// Computed
// --------------------------------------------------------------------------

const productionMap = computed(() => store.getters.productionMap)

const nbResults = computed(
  () => assets.value.length + persons.value.length + shots.value.length
)

// Functions
// --------------------------------------------------------------------------

const entityPath = (entity, section) => {
  const project = productionMap.value.get(entity.project_id)
  const isTVShow = project?.production_type === 'tvshow'
  const episodeId = isTVShow ? entity.episode_id || 'main' : null
  return getEntityPath(entity.id, entity.project_id, section, episodeId)
}

const personPath = person => getPersonPath(person.id)

const selectPrevious = () => {
  selectedIndex.value--
  if (selectedIndex.value < 0) {
    selectedIndex.value = nbResults.value - 1
  }
}

const selectNext = () => {
  selectedIndex.value++
  if (selectedIndex.value >= nbResults.value) {
    selectedIndex.value = 0
  }
}

const onElementSelected = () => {
  const element = document.getElementById(`result-link-${selectedIndex.value}`)
  if (element) {
    element.click()
    isSearchActive.value = false
    searchQuery.value = ''
  }
}

const onBlur = event => {
  if (!event.relatedTarget?.id.startsWith('result-link-')) {
    isSearchActive.value = false
  }
}

// The browser shows the element in full screen alone, the search hidden
// behind it: the full screen ends first. Ctrl+Alt in a field stays there:
// Windows reports AltGr as Ctrl+Alt, and AltGr+F types a character on some
// layouts.
const focusSearch = event => {
  if (!fullScreenElement.value) {
    searchInput.value?.focus()
  } else if (
    !event.ctrlKey ||
    event.metaKey ||
    !['INPUT', 'TEXTAREA'].includes(event.target?.tagName)
  ) {
    isFocusPending.value = true
    exitDocumentFullScreen()
  }
}

const onKeyDown = event => {
  if (isSearchShortcut(event)) {
    focusSearch(event)
  } else if (isSearchActive.value && event.key === 'ArrowDown') {
    selectNext()
  } else if (isSearchActive.value && event.key === 'ArrowUp') {
    selectPrevious()
  }
}

// Watchers
// --------------------------------------------------------------------------

watch(searchQuery, async () => {
  if (searchQuery.value.length > 0) {
    isSearchActive.value = true
  }

  if (searchQuery.value.length > 2) {
    isLoading.value = true
    try {
      const results = await store.dispatch('searchData', {
        query: searchQuery.value
      })
      assets.value = results.assets
      persons.value = results.persons.map(
        peopleStore.helpers.addAdditionalInformation
      )
      shots.value = results.shots
    } catch (error) {
      console.error(error)
    }
    isLoading.value = false
  } else {
    assets.value = []
    persons.value = []
    shots.value = []
  }
})

watch(isSearchActive, () => {
  if (isSearchActive.value) {
    selectedIndex.value = 0
  }
})

// A player blurs the page as its full screen ends: the focus comes after.
// An exit back to another full screen, like a video over the player, drops
// it.
watch(fullScreenElement, element => {
  if (isFocusPending.value) {
    isFocusPending.value = false
    if (!element) setTimeout(() => searchInput.value?.focus())
  }
})

// Lifecycle
// --------------------------------------------------------------------------

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style lang="scss" scoped>
.result-line {
  align-items: center;
  border: 1px solid transparent;
  cursor: pointer;
  display: flex;
  height: 60px;
  padding: 11px 10px 12px 10px;
  margin: 0;

  a {
    color: var(--text);
    padding: 0.5em;
    padding-right: 0.8em;
    display: inline-block;
    width: 100%;
  }

  &.selected-result {
    background: var(--background-hover);
  }

  &:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}

.search-results {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 5px;
  color: var(--text);
  min-width: 120px;
  position: absolute;
  text-align: left;
  top: 54px;
  width: 350px;
  z-index: 300;
}

.production-name {
  text-transform: uppercase;
  font-size: 0.9em;
  color: $grey;
}

.global-search-field {
  width: 180px;
  padding-top: 9px;
  position: relative;

  input {
    border-radius: 10px;
    padding-left: 35px;
  }

  .search-icon {
    position: absolute;
    color: $grey;
    z-index: 4;
    top: 20px;
    left: 10px;
  }
}

@media screen and (max-width: 768px) {
  .global-search-field {
    width: 120px;
  }
}

.search-loader {
  opacity: 0.5;
  padding-top: 0.8em;
}
</style>
