<template>
  <div class="episodes page fixed-page">
    <div class="episode-list-header page-header">
      <div class="filters-area">
        <search-field
          ref="episode-search-field"
          @change="onSearchChange"
          placeholder="ex: e01 s01, anim=wip"
        />
      </div>
    </div>

    <episode-list
      ref="episode-list"
      :entries="displayedEpisodes"
      :is-loading="isShotsLoading"
      :is-error="isShotsLoadingError"
      :validation-columns="episodeValidationColumns"
      :episode-stats="episodeStats"
      @scroll="saveScrollPosition"
    />

    <edit-episode-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :cancel-route="episodesPath"
      :episode-to-edit="episodeToEdit"
      @confirm="confirmEditEpisode"
    />

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('episodes.delete_error')"
      :cancel-route="episodesPath"
      @confirm="confirmDeleteEpisode"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import EpisodeList from '../lists/EpisodeList.vue'
import DeleteModal from '../widgets/DeleteModal'
import EditEpisodeModal from '../modals/EditEpisodeModal'
import SearchField from '../widgets/SearchField'

export default {
  name: 'episodes',

  components: {
    EpisodeList,
    EditEpisodeModal,
    DeleteModal,
    SearchField
  },

  data () {
    return {
      modals: {
        isNewDisplayed: false,
        isDeleteDisplayed: false
      },
      loading: {
        edit: false,
        del: false
      },
      errors: {
        edit: false,
        del: false
      },
      episodeToDelete: null,
      episodeToEdit: null
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
      'episodeValidationColumns'
    ])
  },

  mounted () {
    this.setDefaultSearchText()
    this.setDefaultListScrollPosition()
    this.resizeHeaders()
    this.initEpisodes()
      .then(this.handleModalsDisplay)
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

    confirmEditEpisode (form) {
      this.loading.edit = true
      this.errors.edit = false

      this.editEpisode(form)
        .then(() => {
          this.loading.edit = false
          this.modals.isNewDisplayed = false
          this.navigateToList()
        })
        .catch(() => {
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    confirmDeleteEpisode () {
      this.loading.delete = true
      this.errors.edit = false

      this.deleteEpisode(this.episodeToDelete)
        .then(() => {
          this.loading.delete = false
          this.navigateToList()
        }).catch(() => {
          this.loading.delete = false
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

    handleModalsDisplay () {
      const path = this.$store.state.route.path
      const episodeId = this.$store.state.route.params.episode_id
      this.errors = {
        edit: false,
        delete: false
      }

      this.modals = {
        isNewDisplayed: false,
        isDeleteDisplayed: false
      }

      if (path.indexOf('edit') > 0) {
        this.episodeToEdit = this.episodeMap[episodeId]
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        this.episodeToDelete = this.episodeMap[episodeId]
        this.modals.isDeleteDisplayed = true
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
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() },

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
.data-list {
  margin-top: 0;
}

.filters-area {
  margin-bottom: 2em;
}
</style>
