<template>
  <div class="episodes page fixed-page">
    <div class="episode-list-header page-header flexrow">
      <search-field
        class="flexrow-item mt1"
        ref="episode-search-field"
        @change="onSearchChange"
        placeholder="ex: e01 s01, anim=wip"
      />
      <combobox
        class="mb0 flexrow-item"
        locale-key-prefix="statistics."
        :label="$t('statistics.data_mode')"
        :options="dataModeOptions"
        v-model="dataMode"
      />
      <combobox
        class="mb0 flexrow-item"
        locale-key-prefix="statistics."
        :label="$t('statistics.display_mode')"
        :options="displayModeOptions"
        v-model="displayMode"
      />
      <combobox
        class="mb0 flexrow-item"
        :label="$t('statistics.count_mode')"
        locale-key-prefix="statistics."
        :options="countModeOptions"
        v-model="countMode"
      />
      <combobox
        class="mb0 flexrow-item"
        :label="$t('statistics.episode_status')"
        locale-key-prefix="statistics."
        :options="statusModeOptions"
        v-model="statusMode"
      />

      <span class="filler"></span>
      <button-simple
        class="flexrow-item"
        icon="refresh"
        :title="$t('main.reload')"
        @click="reset"
      />
      <button-simple
        class="flexrow-item"
        :disabled="isLoading"
        icon="download"
        @click="exportStatisticsToCsv"
      />
    </div>

    <episode-stats-list
      ref="episode-list"
      :count-mode="countMode"
      :data-mode="dataMode"
      :display-mode="displayMode"
      :entries="
        statusMode === 'running'
          ? displayedEpisodes.filter(e => e.status === 'running')
          : displayedEpisodes
      "
      :episode-stats="episodeStats"
      :episode-retakes-stats="episodeRetakeStats"
      :is-loading="isLoading"
      :is-error="isLoadingError"
      :show-all="episodeSearchText.length === 0"
      :validation-columns="episodeValidationColumns"
      @field-changed="onFieldChanged"
      @scroll="saveScrollPosition"
    />
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'

import { searchMixin } from '@/components/mixins/search'

import csv from '@/lib/csv'
import preferences from '@/lib/preferences'
import stringHelpers from '@/lib/string'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import EpisodeStatsList from '@/components/lists/EpisodeStatsList.vue'
import SearchField from '@/components/widgets/SearchField.vue'

export default {
  name: 'episode-stats',

  mixins: [searchMixin],

  components: {
    ButtonSimple,
    Combobox,
    EpisodeStatsList,
    SearchField
  },

  data() {
    return {
      countMode: 'count',
      dataMode: 'retakes',
      displayMode: 'pie',
      isLoading: true,
      isLoadingError: false,
      statusMode: 'running',
      countModeOptions: [
        { label: 'shots', value: 'count' },
        { label: 'frames', value: 'frames' }
      ],
      dataModeOptions: [
        { label: 'retakes', value: 'retakes' },
        { label: 'status', value: 'status' }
      ],
      displayModeOptions: [
        { label: 'pie', value: 'pie' },
        { label: 'count', value: 'count' }
      ],
      statusModeOptions: [
        { label: 'only_running', value: 'running' },
        { label: 'all', value: 'all' }
      ]
    }
  },

  mounted() {
    this.setCountOptions()
    const mode = preferences.getPreference('stats:episode-mode') || 'retakes'
    this.dataMode = mode
    this.setDefaultListScrollPosition()
    this.isLoading = true
    this.isLoadingError = false
    this.setSearchFromUrl()
    this.initEpisodeStats()
      .then(() => {
        this.isLoading = false
        this.setSearchInUrl()
        this.onSearchChange()
      })
      .catch(err => {
        this.isLoading = false
        this.isLoadingError = true
        console.error(err)
      })
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'displayedEpisodes',
      'episodeMap',
      'episodeStats',
      'episodeRetakeStats',
      'episodeSearchText',
      'episodeListScrollPosition',
      'episodeValidationColumns',
      'isPaperProduction',
      'taskStatusMap',
      'taskTypeMap'
    ]),

    searchField() {
      return this.$refs['episode-search-field']
    },

    isRetakeDataMode() {
      return this.dataMode === 'retakes'
    }
  },

  methods: {
    ...mapActions([
      'editEpisode',
      'initEpisodeStats',
      'loadEpisodeStats',
      'loadEpisodeRetakeStats',
      'setEpisodeSearch',
      'setEpisodeListScrollPosition'
    ]),

    setCountOptions() {
      if (this.isPaperProduction) {
        this.countModeOptions = [
          { label: 'shots', value: 'count' },
          { label: 'drawings', value: 'drawings' }
        ]
      } else {
        this.countModeOptions = [
          { label: 'shots', value: 'count' },
          { label: 'frames', value: 'frames' }
        ]
      }
      this.countMode = this.countModeOptions[0].value
    },

    setDefaultListScrollPosition() {
      this.$refs['episode-list'].setScrollPosition(
        this.episodeListScrollPosition
      )
    },

    onSearchChange() {
      const searchQuery = this.searchField.getValue()
      this.setSearchInUrl()
      this.setEpisodeSearch(searchQuery)
    },

    saveScrollPosition(scrollPosition) {
      this.setEpisodeListScrollPosition(scrollPosition)
    },

    exportStatisticsToCsv() {
      const nameData = [
        moment().format('YYYYMMDD'),
        this.currentProduction.name,
        'episodes',
        'statistics'
      ]
      if (this.isRetakeDataMode) nameData.splice(3, 0, 'retake')
      const name = stringHelpers.slugify(nameData.join('_'))
      if (this.isRetakeDataMode) {
        csv.generateRetakeStatReports(
          name,
          this.episodeRetakeStats,
          this.taskTypeMap,
          this.taskStatusMap,
          this.episodeMap,
          this.countMode,
          this.currentProduction
        )
      } else {
        csv.generateStatReports(
          name,
          this.episodeStats,
          this.taskTypeMap,
          this.taskStatusMap,
          this.episodeMap,
          this.countMode,
          this.currentProduction
        )
      }
    },

    onFieldChanged({ entry, fieldName, value }) {
      const data = { id: entry.id }
      data[fieldName] = value
      this.editEpisode(data)
    },

    reset() {
      this.isLoading = true
      this.isLoadingError = false
      this.setCountOptions()
      this.loadEpisodeStats(this.currentProduction.id)
        .then(() => {
          return this.loadEpisodeRetakeStats(this.currentProduction.id)
        })
        .then(() => {
          this.isLoading = false
        })
        .catch(err => {
          this.isLoading = false
          this.isLoadingError = true
          console.error(err)
        })
    }
  },

  watch: {
    currentProduction() {
      this.searchField.setValue('')
      this.$store.commit('SET_SEQUENCE_LIST_SCROLL_POSITION', 0)
      this.reset()
    },

    dataMode() {
      preferences.setPreference('stats:episode-mode', this.dataMode)
    }
  },

  head() {
    return {
      title: `${this.currentProduction.name} ${this.$t(
        'episodes.title'
      )} - Kitsu`
    }
  }
}
</script>
