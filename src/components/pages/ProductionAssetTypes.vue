<template>
  <div class="asset-types page fixed-page">
    <div class="asset-type-list-header page-header flexrow">
      <search-field
        class="flexrow-item"
        ref="asset-type-search-field"
        @change="onSearchChange"
        placeholder="ex: chars, agent327"
      />
      <span class="flexrow-item">
        {{ $t('statistics.display_mode') }}
      </span>
      <combobox
        class="mb0 flexrow-item"
        locale-key-prefix="statistics."
        :options="displayModeOptions"
        v-model="displayMode"
      />
    </div>

    <production-asset-type-list
      ref="asset-type-list"
      :entries="displayedAssetTypes"
      :is-loading="isAssetsLoading || initialLoading"
      :is-error="isAssetsLoadingError"
      :validation-columns="assetValidationColumns"
      :asset-type-stats="assetTypeStats"
      :display-mode="displayMode"
      :show-all="assetTypeSearchText.length === 0"
      @scroll="saveScrollPosition"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Combobox from '../widgets/Combobox'
import ProductionAssetTypeList from '../lists/ProductionAssetTypeList.vue'
import SearchField from '../widgets/SearchField'

export default {
  name: 'production-asset-types',

  components: {
    Combobox,
    ProductionAssetTypeList,
    SearchField
  },

  data () {
    return {
      initialLoading: true,
      displayMode: 'pie',
      displayModeOptions: [
        { label: 'pie', value: 'pie' },
        { label: 'count', value: 'count' }
      ]
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
      'isAssetsLoadingError',
      'isTVShow'
    ])
  },

  created () {
  },

  mounted () {
    this.setDefaultSearchText()
    this.setDefaultListScrollPosition()
    setTimeout(() => {
      this.initAssetTypes()
        .then(this.handleModalsDisplay)
        .then(() => {
          this.initialLoading = false
        })
    }, 100)
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
      this.$refs['asset-type-search-field'].setValue('')

      if (!this.isTVShow) {
        this.initialLoading = true
        this.loadAssets(() => {
          this.computeAssetTypeStats()
          this.setAssetTypeListScrollPosition(0)
          this.initialLoading = false
        })
      }
    },

    currentEpisode () {
      if (this.isTVShow) {
        this.initialLoading = true
        this.$refs['asset-type-search-field'].setValue('')
        this.setAssetTypeListScrollPosition(0)

        this.loadAssets(() => {
          this.computeAssetTypeStats()
          this.initialLoading = false
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
      title: `${this.currentProduction.name} | ${this.$t('asset_types.production_title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
