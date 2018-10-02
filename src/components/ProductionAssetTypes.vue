<template>
  <div class="asset-types page fixed-page">
    <div class="asset-type-list-header page-header">
      <div class="filters-area">
        <search-field
          ref="asset-type-search-field"
          @change="onSearchChange"
          placeholder="ex: chars, agent327"
        />
      </div>
    </div>

    <production-asset-type-list
      ref="asset-type-list"
      :entries="displayedAssetTypes"
      :is-loading="isAssetsLoading"
      :is-error="isAssetsLoadingError"
      :validation-columns="assetValidationColumns"
      :asset-type-stats="assetTypeStats"
      @scroll="saveScrollPosition"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { SearchIcon } from 'vue-feather-icons'
import ProductionAssetTypeList from './lists/ProductionAssetTypeList.vue'
import PageTitle from './widgets/PageTitle'
import SearchField from './widgets/SearchField'

export default {
  name: 'production-asset-types',

  components: {
    ProductionAssetTypeList,
    PageTitle,
    SearchField,
    SearchIcon
  },

  data () {
    return {
    }
  },

  computed: {
    ...mapGetters([
      'assetTypePath',
      'assetTypeStats',
      'assetTypeSearchText',
      'assetTypeListScrollPosition',
      'assetValidationColumns',
      'currentEpisode',
      'currentProduction',
      'displayedAssetTypes',
      'isAssetsLoading',
      'isAssetsLoadingError'
    ])
  },

  created () {
  },

  mounted () {
    this.setDefaultSearchText()
    this.setDefaultListScrollPosition()
    this.initAssetTypes()
      .then(this.handleModalsDisplay)
  },

  methods: {
    ...mapActions([
      'computeAssetTypeStats',
      'initAssetTypes',
      'isTVShow',
      'loadAssets',
      'loadComment',
      'setAssetTypeSearch',
      'setAssetTypeListScrollPosition',
      'setLastProductionScreen'
    ]),

    setDefaultSearchText () {
      if (this.assetTypeSearchText.length > 0) {
        this.$refs['asset-type-search-field'].setValue(
          this.assetTypeSearchText
        )
      }
    },

    setDefaultListScrollPosition () {
      this.$refs['asset-type-list'].setScrollPosition(
        this.assetTypeListScrollPosition
      )
    },

    navigateToList () {
      this.$router.push(this.assetTypesPath)
    },

    onSearchChange (event) {
      const searchQuery = this.$refs['asset-type-search-field'].getValue()
      this.setAssetTypeSearch(searchQuery)
    },

    saveScrollPosition (scrollPosition) {
      this.setAssetTypeListScrollPosition(scrollPosition)
    }
  },

  watch: {
    currentProduction () {
      this.$refs['asset-type-search-field'].setValue('')
      this.setAssetTypeListScrollPosition(0)

      this.loadAssets(() => {
        this.computeAssetTypeStats()
      })
    },

    currentEpisode () {
      if (this.isTVShow) {
        this.$refs['asset-type-search-field'].setValue('')
        this.setAssetTypeListScrollPosition(0)

        this.loadAssets(() => {
          this.computeAssetTypeStats()
        })
      }
    }
  },

  socket: {
    events: {
      'comment:new' (eventData) {
        const commentId = eventData.comment_id
        this.loadComment({
          commentId,
          callback: () => {
            this.computeAssetTypeStats()
          }
        })
      }
    }
  },

  metaInfo () {
    return {
      title: `${this.currentProduction.name} | ${this.$t('asset_types.title')} - Kitsu`
    }
  }
}
</script>

<style scoped>
.data-list {
  margin-top: 0;
}

.filters-area {
  margin-bottom: 2em;
}
</style>
