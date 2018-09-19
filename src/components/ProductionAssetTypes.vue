<template>
  <div class="asset-types page fixed-page">
    <div class="asset-type-list-header page-header">
      <page-title :text="$t('asset_types.title')"></page-title>

      <div class="filters-area">
        <search-field
          ref="asset-type-search-field"
          @change="onSearchChange"
          placeholder="ex: chars, agent327"
        >
        </search-field>
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
    ></production-asset-type-list>
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
      'currentProduction',
      'displayedAssetTypes',
      'isAssetsLoading',
      'isAssetsLoadingError'
    ])
  },

  created () {
    this.initAssetTypes()
      .then(this.handleModalsDisplay)
  },

  mounted () {
    this.setDefaultSearchText()
    this.setDefaultListScrollPosition()
  },

  methods: {
    ...mapActions([
      'computeAssetTypeStats',
      'initAssetTypes',
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
      const productionId = this.$route.params.production_id
      if (this.currentProduction.id !== productionId) {
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
      title: `${this.currentProduction.name} ${this.$t('asset_types.title')} - Kitsu`
    }
  }
}
</script>

<style scoped>
.data-list {
  margin-top: 0;
}
</style>
