<template>
  <div class="entity-search page">
    <form @submit.prevent="onResultSelected()">
      <div class="search-field">
        <span class="search-icon">
          <search-icon width="20" />
        </span>
        <input
          ref="search-field"
          class="input"
          :placeholder="$t('search.placeholder')"
          v-model.trim="searchQuery"
        />
      </div>
      <div class="search-filter pa1 flexrow">
        <checkbox
          :toggle="true"
          :label="$t('assets.title')"
          v-model="searchFilter.assets"
        />
        <checkbox
          :toggle="true"
          :label="$t('shots.title')"
          v-model="searchFilter.shots"
        />
        <!--
        <checkbox
          :toggle="true"
          :label="$t('people.title')"
          v-if="results.persons"
          v-model="searchFilter.persons"
        />
        -->
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
        <div class="pb1" v-if="this.searchFilter.assets">
          <h2 class="mt0">
            {{ $t('assets.title') }} ({{ this.results.assets?.length || 0 }})
          </h2>
          <div class="has-text-centered" v-if="!this.results.assets?.length">
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
              v-for="entity in this.results.assets"
            >
              <entity-preview
                :empty-height="200"
                :empty-width="300"
                :height="200"
                :width="300"
                :entity="entity"
              />
              <router-link
                class="result-name"
                :id="`result-link-${entity.id}`"
                :to="entityPath(entity, 'asset')"
              >
                <div class="production-name">
                  {{ entity.project_name }}
                </div>
                <div class="entity-name">
                  {{ entity.asset_type_name }} / {{ entity.name }}
                </div>
              </router-link>
            </div>
          </div>
        </div>
        <div class="pb1" v-if="this.searchFilter.shots">
          <h2 class="mt0">
            {{ $t('shots.title') }} ({{ this.results.shots?.length || 0 }})
          </h2>
          <div class="has-text-centered" v-if="!this.results.shots?.length">
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
              v-for="entity in this.results.shots"
            >
              <entity-preview
                :empty-height="200"
                :empty-width="300"
                :height="200"
                :width="300"
                :entity="entity"
              />
              <router-link
                class="result-name"
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
              </router-link>
            </div>
          </div>
        </div>
        <!--
        <div class="pb1" v-if="this.searchFilter.persons">
          <h2 class="mt0">
            {{ $t('people.title') }} ({{ this.results.persons?.length || 0 }})
          </h2>
          <div class="has-text-centered" v-if="!this.results.persons.length">
            {{ $t('main.search.no_result') }}
          </div>
          <div class="result-list" v-else>
            <div
              class="result flexcolumn"
              :class="{
                'selected-result': flattenResults[selectedIndex] === person
              }"
              :key="person.id"
              @mouseover="selectResultById(person.id)"
              v-for="person in this.results.persons"
            >
              <router-link
                :id="`result-link-${person.id}`"
                :to="personPath(person)"
              >
                <div class="flexcolumn has-text-centered">
                  <people-avatar
                    class="mauto"
                    :is-link="false"
                    :person="person"
                    :size="200"
                  />
                  <div class="result-name">
                    <div class="person-name">{{ person.name }}</div>
                    <div class="person-email">{{ person.email }}</div>
                    <div class="person-role">
                      {{ $t(`people.role.${person.role}`) }}
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
        -->
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

import { SearchIcon } from 'vue-feather-icons'

// import peopleStore from '@/store/modules/people'

import Checkbox from '@/components/widgets/Checkbox'
import EntityPreview from '@/components/widgets/EntityPreview'
// import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import Spinner from '@/components/widgets/Spinner'

export default {
  name: 'entity-search',
  mixins: [],

  components: {
    Checkbox,
    EntityPreview,
    // PeopleAvatar,
    SearchIcon,
    Spinner
  },

  data() {
    return {
      isLoading: false,
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

  props: {},

  mounted() {
    window.addEventListener('keydown', event => {
      if (event.ctrlKey && event.altKey && event.keyCode === 70) {
        if (this.$refs['search-field']) {
          this.$refs['search-field'].focus()
        }
      } else if (event.keyCode === 40) {
        this.selectNext()
      } else if (event.keyCode === 38) {
        this.selectPrevious()
      }
    })

    if (this.$route.query.search) {
      this.searchQuery = this.$route.query.search
    }

    this.searchField.focus()
  },

  computed: {
    ...mapGetters(['productionMap']),

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
    }
  },

  methods: {
    ...mapActions(['searchData']),

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
        document.getElementById(`result-link-${item.id}`).scrollIntoView(false)
      }
    },

    selectResultById(id) {
      this.selectedIndex = this.flattenResults.findIndex(item => item.id === id)
    },

    onResultSelected() {
      const item = this.flattenResults[this.selectedIndex]
      if (item) {
        document.getElementById(`result-link-${item.id}`).click()
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
    }
  },

  watch: {
    searchQuery() {
      if (this.searchQuery.length) {
        this.$router.push({ query: { search: this.searchQuery } })
      } else {
        this.$router.push({ query: {} })
      }

      if (this.searchQuery.length > 2) {
        this.isLoading = true
        this.searchData({ query: this.searchQuery, limit: 10 })
          .then(results => {
            // results.persons?.forEach(person => {
            //   peopleStore.helpers.addAdditionalInformation(person)
            // })
            delete results.persons
            this.results = results
          })
          .catch(console.error)
          .finally(() => {
            this.isLoading = false
          })
      } else {
        this.clearSearchResult()
      }

      this.selectedIndex = 0
    }
  },

  metaInfo() {
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

.search-field {
  max-width: 800px;
  margin: auto;
  padding-top: 40px;
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
    top: 55px;
    left: 10px;
  }
}

.search-filter {
  position: relative;
  max-width: 800px;
  margin: auto;
  gap: 2em;
}

.search-results {
  max-width: 1260px; // 300px * 4 + gap * 3
  margin-left: auto;
  margin-right: auto;

  .result-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
  }

  .result {
    height: 280px;
    background: var(--background);
    border-radius: 1em;
    padding-top: 1em;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);

    .dark & {
      background: var(--background-alt);
    }

    &.selected-result {
      background: var(--background-hover);
    }

    .result-name {
      color: var(--text-strong);
      font-weight: bold;
      padding: 0.3em 1em;
    }
  }
}
</style>
