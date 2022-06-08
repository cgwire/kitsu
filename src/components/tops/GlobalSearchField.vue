<template>
<div
  :class="{
    'global-search-field': true,
    'global-search-field-open': isSearchActive
  }"
>
  <span class="search-icon">
    <search-icon width="20" />
  </span>
  <input
    ref="global-search-field"
    class="input"
    @focus="isSearchActive = true"
    @blur="onBlur"
    @keyup.enter="onElementSelected"
    v-model="searchQuery"
  />
  <div
    class="search-results"
    :style="{
      'min-height': (nbResults * 60) + 'px'
    }"
    v-if="isSearchActive"
  >
    <div
      v-if="results.length > 0"
    >
      <div
        class="search-loader"
        :style="{
          'min-height': (nbResults * 60) + 'px'
        }"
        v-if="isLoading"
      >
        <div><spinner /></div>
      </div>
      <div
        :key="asset.id"
        :class="{
          'result-line': true,
          'selected-result': selectedIndex === index
        }"
        @click="onElementSelected"
        v-for="(asset, index) in results"
      >
        <router-link
          :id="'result-link-' + index"
          :to="entityPath(asset)"
        >
          <div
            class="flexrow"
            @mouseover="selectedIndex = index"
          >
            <div
              class="flexrow-item"
            >
              <entity-thumbnail
                style="margin-top: 5px;"
                :empty-height="40"
                :empty-width="60"
                :height="40"
                :width="60"
                :entity="asset"
                :with-link="false"
              />
            </div>
            <div
              class="flexrow-item"
            >
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
    </div>

    <div class="result-line" v-else-if="searchQuery.length < 3">
      {{ $t('main.search.type') }}
    </div>

    <div class="result-line" v-else>
      {{ $t('main.search.no_result') }}
    </div>

  </div>
</div>

</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getEntityPath } from '@/lib/path'

import { SearchIcon } from 'vue-feather-icons'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import Spinner from '@/components/widgets/Spinner'

export default {
  name: 'global-search-field',

  components: {
    EntityThumbnail,
    SearchIcon,
    Spinner
  },

  data () {
    return {
      isLoading: true,
      isSearchActive: false,
      results: [],
      selectedIndex: 0,
      searchQuery: ''
    }
  },

  props: {
  },

  mounted () {
    window.addEventListener('keydown', event => {
      if (event.ctrlKey && event.altKey && event.keyCode === 70) {
        if (this.$refs['global-search-field']) {
          this.$refs['global-search-field'].focus()
        }
      } else if (this.isSearchActive && event.keyCode === 40) {
        this.selectNext()
      } else if (this.isSearchActive && event.keyCode === 38) {
        this.selectPrevious()
      }
    })
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'productionMap'
    ]),

    entityPath () {
      const section = 'asset'
      return (entity) => {
        const project = this.productionMap.get(entity.project_id)
        const isTVShow = project.production_type === 'tvshow'
        let episodeId = null
        if (isTVShow) episodeId = entity.episode_id || 'main'
        return getEntityPath(
          entity.id,
          entity.project_id,
          section,
          episodeId
        )
      }
    },

    nbResults () {
      console.log(this.results.length)
      return this.results.length > 0 ? this.results.length : 1
    }
  },

  methods: {
    ...mapActions([
      'searchData'
    ]),

    selectPrevious () {
      this.selectedIndex--
      if (this.selectedIndex < 0) {
        this.selectedIndex = this.results.length - 1
      }
    },

    selectNext () {
      this.selectedIndex++
      if (this.selectedIndex >= this.results.length) {
        this.selectedIndex = 0
      }
    },

    onElementSelected () {
      document.getElementById('result-link-' + this.selectedIndex).click()
      this.isSearchActive = false
      this.searchQuery = ''
    },

    onBlur () {
      setTimeout(() => {
        this.isSearchActive = false
      }, 100)
    }
  },

  watch: {
    searchQuery () {
      if (this.searchQuery.length > 0) {
        this.isSearchActive = true
      }

      if (this.searchQuery.length > 2) {
        this.isLoading = true
        this.searchData({ query: this.searchQuery })
          .then(results => {
            this.isLoading = false
            this.results = results.assets
          })
          .catch(console.error)
      } else {
        this.results = 0
      }
    },

    isSearchActive () {
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
    padding: 0.5em ;
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
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  input {
    border-radius: 10px;
    padding-left: 35px;
  }

  .search-icon {
    position: absolute;
    color: $grey;
    z-index: 4;
    top: 18px;
    left: 10px;
  }
}

.search-loader {
  background: var(--background);
  left: 0;
  opacity: 0.5;
  padding-top: 0.8em;
  position: absolute;
  top: 0;
  width: 350px;
}
</style>
