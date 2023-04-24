<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="global-search-field">
        <span class="search-icon">
          <search-icon width="20" />
        </span>
        <input
          ref="global-search-field"
          class="input"
          placeholder="Search for an entity in the database..."
          @keyup.enter="onElementSelected"
          v-model="searchQuery"
        />
      </div>
      <div class="search-results">
        <div
          class="result-line has-text-centered"
          v-if="searchQuery.length < 3"
        >
          {{ $t('main.search.type') }}
        </div>
        <div
          class="search-loader"
          :style="{
            'min-height': nbResults * 60 + 'px'
          }"
          v-else-if="isLoading"
        >
          <div><spinner /></div>
        </div>
        <div class="result-list" v-else-if="nbResults > 0">
          <div
            :key="asset.id"
            :class="{
              'result-line': true,
              'selected-result': selectedIndex === index
            }"
            v-for="(asset, index) in assets"
          >
            <div class="flexcolumn result">
              <div class="">
                <entity-preview
                  style="margin-top: 5px"
                  :empty-height="200"
                  :empty-width="300"
                  :height="200"
                  :width="300"
                  :entity="asset"
                />
              </div>
              <router-link
                class="result-name"
                :id="'result-link-' + index"
                :to="entityPath(asset)"
              >
                <div class="">
                  <div class="production-name">
                    {{ asset.project_name }}
                  </div>
                  <div class="asset-type-name">
                    {{ asset.asset_type_name }} / {{ asset.name }}
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <div class="result-line" v-else>
          {{ $t('main.search.no_result') }}
        </div>
      </div>
    </div>

    <div
      class="column side-column is-hidden-mobile hide-small-screen"
      v-if="currentTask"
    >
      <task-info :task="currentTask" :is-loading="loading.currentTask" />
    </div>
  </div>
</template>

<script>
/*
 * Page to allow wide search on every entities stored in the open projects.
 */
import { mapGetters, mapActions } from 'vuex'
import { getEntityPath, getPersonPath } from '@/lib/path'
import peopleStore from '@/store/modules/people'

import { SearchIcon } from 'vue-feather-icons'

import EntityPreview from '@/components/widgets/EntityPreview'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import PeopleName from '@/components/widgets/PeopleName'
import Spinner from '@/components/widgets/Spinner'
import TaskInfo from '@/components/sides/TaskInfo'

export default {
  name: 'entity-search',
  mixins: [],

  components: {
    EntityPreview,
    PeopleAvatar,
    PeopleName,
    SearchIcon,
    Spinner
  },

  data() {
    return {
      assets: [],
      currentTask: null,
      isLoading: false,
      selectedIndex: 0,
      searchQuery: ''
    }
  },

  props: {},

  mounted() {
    window.addEventListener('keydown', event => {
      if (event.ctrlKey && event.altKey && event.keyCode === 70) {
        if (this.$refs['global-search-field']) {
          this.$refs['global-search-field'].focus()
        }
      } else if (event.keyCode === 40) {
        this.selectNext()
      } else if (event.keyCode === 38) {
        this.selectPrevious()
      }
    })

    this.searchField.focus()
  },

  computed: {
    ...mapGetters(['currentEpisode', 'currentProduction', 'productionMap']),

    searchField() {
      return this.$refs['global-search-field']
    },

    entityPath() {
      const section = 'asset'
      return entity => {
        const project = this.productionMap.get(entity.project_id)
        const isTVShow = project.production_type === 'tvshow'
        let episodeId = null
        if (isTVShow) episodeId = entity.episode_id || 'main'
        return getEntityPath(entity.id, entity.project_id, section, episodeId)
      }
    },

    personPath() {
      return person => {
        return getPersonPath(person.id)
      }
    },

    nbResults() {
      const length = this.assets.length
      return length
    }
  },

  methods: {
    ...mapActions(['searchData']),

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
      document.getElementById('result-link-' + this.selectedIndex).click()
      this.searchQuery = ''
    }
  },

  watch: {
    searchQuery() {
      if (this.searchQuery.length > 2) {
        this.isLoading = true
        this.searchData({ query: this.searchQuery, limit: 10 })
          .then(results => {
            this.isLoading = false
            this.assets = results.assets
          })
          .catch(console.error)
      } else {
        this.assets = []
      }
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
.fixed-page {
  padding-top: 60px;
}

.result-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: 20px;
  row-gap: 20px;
  max-width: 1240px;
  margin: auto;
}

.search-results {
  margin-top: 3em;
}

.global-search-field {
  max-width: 800px;
  margin: auto;
  padding-top: 40px;
  position: relative;
  width: 100%;

  &.global-search-field-open {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  input {
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

.result {
  height: 280px;
}

.result {
  background: $white-grey-light;
  border-radius: 1em;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);

  .result-name {
    color: $mid-grey;
    font-weight: bold;
    padding: 0.3em 1em;
  }
}

.thumbnail-wrapper {
  margin: 0;
}
</style>
