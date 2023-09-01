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
          <search-icon width="20" />
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
          @input="search"
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
                  <span class="match-icon"><search-icon width="15" /></span>
                  {{ getMatchDetails(entity) }}
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
                  <span class="match-icon"><search-icon width="15" /></span>
                  <span class="match-details">{{
                    getMatchDetails(entity)
                  }}</span>
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
                  <div class="result-description">
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
import Combobox from '@/components/widgets/Combobox'
import ComboboxProduction from '@/components/widgets/ComboboxProduction'
import EntityPreview from '@/components/widgets/EntityPreview'
// import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import Spinner from '@/components/widgets/Spinner'

const AVAILABLE_LIMITS = [12, 24, 48]

export default {
  name: 'entity-search',
  mixins: [],

  components: {
    Checkbox,
    Combobox,
    ComboboxProduction,
    EntityPreview,
    // PeopleAvatar,
    SearchIcon,
    Spinner
  },

  data() {
    return {
      isLoading: false,
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
    top: 15px;
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
        margin-top: -2px;
        margin-right: 0.5em;
      }
    }
  }
}
</style>
