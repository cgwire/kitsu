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
      <span class="filler"></span>
      <button-simple
        class="flexrow-item"
        icon="download"
        @click="exportStatisticsToCsv"
      />
    </div>

    <episode-list
      ref="episode-list"
      :entries="displayedEpisodes"
      :is-loading="isShotsLoading"
      :is-error="isShotsLoadingError"
      :validation-columns="episodeValidationColumns"
      :episode-stats="episodeStats"
      :count-mode="countMode"
      :display-mode="displayMode"
      :show-all="episodeSearchText.length === 0"
      @scroll="saveScrollPosition"
      @delete-clicked="onDeleteClicked"
      @edit-clicked="onEditClicked"
    />

    <edit-episode-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :episode-to-edit="episodeToEdit"
      @cancel="modals.isNewDisplayed = false"
      @confirm="confirmEditEpisode"
    />

    <hard-delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('episodes.delete_error')"
      :lock-text="episodeToDelete ? episodeToDelete.name : ''"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteEpisode"
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
import HardDeleteModal from '../modals/HardDeleteModal'
import EditEpisodeModal from '../modals/EditEpisodeModal'
import EpisodeList from '../lists/EpisodeList.vue'
import SearchField from '../widgets/SearchField'

export default {
  name: 'episodes',

  components: {
    ButtonSimple,
    Combobox,
    EpisodeList,
    EditEpisodeModal,
    HardDeleteModal,
    SearchField
  },

  data () {
    return {
      countMode: 'count',
      displayMode: 'pie',
      episodeToDelete: null,
      episodeToEdit: null,
      countModeOptions: [
        { label: 'shots', value: 'count' },
        { label: 'frames', value: 'frames' }
      ],
      displayModeOptions: [
        { label: 'pie', value: 'pie' },
        { label: 'count', value: 'count' }
      ],
      errors: {
        edit: false,
        del: false
      },
      modals: {
        isNewDisplayed: false,
        isDeleteDisplayed: false
      },
      loading: {
        edit: false,
        del: false
      }
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'displayedEpisodes',
      'episodesPath',
      'isCurrentUserManager',
      'isShotsLoading',
      'isShotsLoadingError',
      'episodes',
      'episodeMap',
      'episodePath',
      'episodeStats',
      'episodeSearchText',
      'episodeListScrollPosition',
      'episodeValidationColumns',
      'taskStatusMap',
      'taskTypeMap'
    ])
  },

  mounted () {
    this.setDefaultSearchText()
    this.setDefaultListScrollPosition()
    this.resizeHeaders()
    this.initEpisodes()
  },

  methods: {
    ...mapActions([
      'computeEpisodeStats',
      'deleteEpisode',
      'editEpisode',
      'hideAssignations',
      'initEpisodes',
      'loadComment',
      'loadShots',
      'setLastProductionScreen',
      'setEpisodeSearch',
      'setEpisodeListScrollPosition',
      'showAssignations'
    ]),

    setDefaultSearchText () {
      if (this.episodeSearchText.length > 0) {
        this.$refs['episode-search-field'].setValue(this.episodeSearchText)
      }
    },

    setDefaultListScrollPosition () {
      this.$refs['episode-list'].setScrollPosition(
        this.episodeListScrollPosition
      )
    },

    navigateToList () {
      this.$router.push(this.episodesPath)
    },

    onEditClicked (episode) {
      this.episodeToEdit = episode
      this.modals.isNewDisplayed = true
    },

    onDeleteClicked (episode) {
      this.episodeToDelete = episode
      this.modals.isDeleteDisplayed = true
    },

    confirmEditEpisode (form) {
      this.loading.edit = true
      this.errors.edit = false

      this.editEpisode(form)
        .then(() => {
          this.loading.edit = false
          this.modals.isNewDisplayed = false
        })
        .catch(() => {
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    confirmDeleteEpisode () {
      this.loading.del = true
      this.errors.edit = false

      this.deleteEpisode(this.episodeToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.isDeleteDisplayed = false
        }).catch(() => {
          this.loading.del = false
          this.errors.delete = true
        })
    },

    resetEditModal () {
      const form = { name: '' }
      if (this.episodes.length > 0) {
        form.episode_id = this.episodes[0].id
      }
      if (this.openProductions.length > 0) {
        form.production_id = this.openProductions[0].id
      }
      this.episodeToEdit = form
    },

    deleteText () {
      const episode = this.episodeToDelete
      if (episode) {
        return this.$t('episodes.delete_text', { name: episode.name })
      } else {
        return ''
      }
    },

    onSearchChange (event) {
      const searchQuery = this.$refs['episode-search-field'].getValue()
      this.setEpisodeSearch(searchQuery)
      this.resizeHeaders()
    },

    saveScrollPosition (scrollPosition) {
      this.setEpisodeListScrollPosition(scrollPosition)
    },

    resizeHeaders () {
      setTimeout(() => {
        if (this.$refs['episode-list']) {
          this.$refs['episode-list'].resizeHeaders()
        }
      }, 0)
    },

    exportStatisticsToCsv () {
      const nameData = [
        moment().format('YYYYMMDD'),
        this.currentProduction.name,
        'episodes',
        'statistics'
      ]
      const name = slugify(nameData.join('_'))
      csv.generateStatReports(
        name,
        this.episodeStats,
        this.taskTypeMap,
        this.taskStatusMap,
        this.episodeMap,
        this.countMode
      )
    }
  },

  watch: {
    displayedEpisodes () {
      this.resizeHeaders()
    },

    currentProduction () {
      const productionId = this.$route.params.production_id
      if (this.currentProduction.id !== productionId) {
        const newPath = {
          name: 'episodes',
          params: { production_id: this.currentProduction.id }
        }
        this.$refs['episode-search-field'].setValue('')
        this.$store.commit('SET_SEQUENCE_LIST_SCROLL_POSITION', 0)
        this.$router.push(newPath)
        this.loadShots(() => {
          this.resizeHeaders()
          if (this.isTVShow) {
            this.loadEpisodeStats()
          } else {
            this.computeEpisodeStats()
          }
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
            if (this.isTVShow) {
              this.loadEpisodeStats()
            } else {
              this.computeEpisodeStats()
            }
          }
        })
      }
    }
  },

  metaInfo () {
    return {
      title: `${this.currentProduction.name} ${this.$t('episodes.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
