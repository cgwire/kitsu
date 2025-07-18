<template>
  <div
    :class="{
      'global-search-field': true,
      'global-search-field-open': isSearchActive
    }"
  >
    <span class="search-icon">
      <search-icon :size="20" />
    </span>
    <input
      ref="global-search-field"
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

<script>
import { SearchIcon } from 'lucide-vue-next'
import { mapGetters, mapActions } from 'vuex'

import { getEntityPath, getPersonPath } from '@/lib/path'
import peopleStore from '@/store/modules/people'

import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'global-search-field',

  components: {
    EntityThumbnail,
    PeopleAvatar,
    PeopleName,
    SearchIcon,
    Spinner
  },

  data() {
    return {
      isLoading: false,
      isSearchActive: false,
      assets: [],
      persons: [],
      shots: [],
      selectedIndex: 0,
      searchQuery: ''
    }
  },

  mounted() {
    window.addEventListener('keydown', this.onKeyDown)
  },

  unmounted() {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  computed: {
    ...mapGetters(['productionMap']),

    nbResults() {
      return this.assets.length + this.persons.length + this.shots.length
    }
  },

  methods: {
    ...mapActions(['searchData']),

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

    selectPrevious() {
      this.selectedIndex--
      if (this.selectedIndex < 0) {
        this.selectedIndex = this.nbResults - 1
      }
    },

    selectNext() {
      this.selectedIndex++
      if (this.selectedIndex >= this.nbResults) {
        this.selectedIndex = 0
      }
    },

    onElementSelected() {
      const element = document.getElementById(
        `result-link-${this.selectedIndex}`
      )
      if (element) {
        element.click()
        this.isSearchActive = false
        this.searchQuery = ''
      }
    },

    onBlur(event) {
      if (!event.relatedTarget?.id.startsWith('result-link-')) {
        this.isSearchActive = false
      }
    },

    onKeyDown(event) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.altKey &&
        event.code === 'KeyF'
      ) {
        this.$refs['global-search-field']?.focus()
      } else if (this.isSearchActive && event.key === 'ArrowDown') {
        this.selectNext()
      } else if (this.isSearchActive && event.key === 'ArrowUp') {
        this.selectPrevious()
      }
    }
  },

  watch: {
    searchQuery() {
      if (this.searchQuery.length > 0) {
        this.isSearchActive = true
      }

      if (this.searchQuery.length > 2) {
        this.isLoading = true
        this.searchData({ query: this.searchQuery })
          .then(results => {
            this.assets = results.assets
            this.persons = results.persons.map(
              peopleStore.helpers.addAdditionalInformation
            )
            this.shots = results.shots
          })
          .catch(console.error)
          .finally(() => {
            this.isLoading = false
          })
      } else {
        this.assets = []
        this.persons = []
        this.shots = []
      }
    },

    isSearchActive() {
      if (this.isSearchActive) {
        this.selectedIndex = 0
      }
    }
  }
}
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
  max-height: 60px;
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

  &.global-search-field-open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

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

.search-loader {
  opacity: 0.5;
  padding-top: 0.8em;
}
</style>
