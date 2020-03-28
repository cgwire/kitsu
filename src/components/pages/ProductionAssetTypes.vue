<template>
  <div class="asset-types page fixed-page">
    <div class="asset-type-list-header page-header flexrow">
      <search-field
        class="flexrow-item mt1"
        ref="asset-type-search-field"
        @change="onSearchChange"
        placeholder="ex: chars, agent327"
      />
      <combobox
        class="mb0 flexrow-item"
        :label="$t('statistics.display_mode')"
        locale-key-prefix="statistics."
        :options="displayModeOptions"
        v-model="displayMode"
      />
      <span class="filler"></span>
      <button-simple
        class="flexrow-item"
        icon="download"
        @click="exportStatisticsToCsv"
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
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'
import csv from '../../lib/csv'
import { slugify } from '../../lib/string'
import ButtonSimple from '../widgets/ButtonSimple'
import Combobox from '../widgets/Combobox'
import ProductionAssetTypeList from '../lists/ProductionAssetTypeList.vue'
import SearchField from '../widgets/SearchField'

export default {
  name: 'production-asset-types',

  components: {
    ButtonSimple,
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
      'assetTypeMap',
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
      'isTVShow',
      'taskStatusMap',
      'taskTypeMap'
    ])
  },

  created () {
  },

  mounted () {
    this.setDefaultSearchText()
    this.setDefaultListScrollPosition()
    setTimeout(() => {
      this.reset()
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
    },

    exportStatisticsToCsv () {
      const nameData = [
        moment().format('YYYYMMDD'),
        this.currentProduction.name,
        'asset_types',
        'statistics'
      ]
      if (this.currentEpisode) {
        nameData.splice(2, 0, this.currentEpisode.name)
      }
      const name = slugify(nameData.join('_'))
      csv.generateStatReports(
        name,
        this.assetTypeStats,
        this.taskTypeMap,
        this.taskStatusMap,
        this.assetTypeMap,
        this.countMode
      )
    },

    reset () {
      this.initialLoading = true
      this.$refs['asset-type-search-field'].setValue('')
      this.loadAssets()
        .then(this.handleModalsDisplay)
        .then(() => {
          this.computeAssetTypeStats()
          this.setAssetTypeListScrollPosition(0)
          this.initialLoading = false
        })
    }
  },

  watch: {
    currentProduction () {
      if (!this.isTVShow) this.reset()
    },

    currentEpisode () {
      if (this.isTVShow) this.reset()
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
