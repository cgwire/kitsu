<template>
  <div class="episodes page fixed-page">
    <div class="episode-list-header page-header">
      <div class="level header-title">
        <div class="level-left">
          <page-title :text="$t('episodes.title')"></page-title>
        </div>
      </div>

      <div class="filters-area">
        <search-field
          ref="episode-search-field"
          @change="onSearchChange"
          placeholder="ex: e01 s01, anim=wip"
        >
        </search-field>
      </div>
    </div>

    <episode-list
      ref="episode-list"
      :entries="displayedEpisodes"
      :is-loading="isShotsLoading"
      :is-error="isShotsLoadingError"
      :validation-columns="shotValidationColumns"
      :episode-stats="episodeStats"
      @scroll="saveScrollPosition"
    ></episode-list>

    <edit-episode-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :cancel-route="{
        name: 'episodes',
        params: {production_id: currentProduction.id}
      }"
      :episode-to-edit="episodeToEdit"
      @confirm="confirmEditEpisode"
    >
    </edit-episode-modal>

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('episodes.delete_error')"
      :cancel-route="{
        name: 'episodes',
        params: {production_id: currentProduction.id}
      }"
      @confirm="confirmDeleteEpisode"
    >
    </delete-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { SearchIcon } from 'vue-feather-icons'
import EpisodeList from './lists/EpisodeList.vue'
import DeleteModal from './widgets/DeleteModal'
import EditEpisodeModal from './modals/EditEpisodeModal'
import PageTitle from './widgets/PageTitle'
import SearchField from './widgets/SearchField'

export default {
  name: 'episodes',

  components: {
    EpisodeList,
    EditEpisodeModal,
    DeleteModal,
    PageTitle,
    SearchField,
    SearchIcon
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
      'isCurrentUserManager',
      'isShotsLoading',
      'isShotsLoadingError',
      'episodes',
      'episodeMap',
      'episodeStats',
      'episodeSearchText',
      'episodeListScrollPosition',
      'shotValidationColumns'
    ])
  },

  created () {
    this.initEpisodes()
      .then(this.handleModalsDisplay)
  },

  mounted () {
    this.setDefaultSearchText()
    this.setDefaultListScrollPosition()
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
      'setProduction',
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
      this.$router.push({
        name: 'episodes',
        params: {production_id: this.currentProduction.id}
      })
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
        return this.$t('episodes.delete_text', {name: episode.name})
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
    },

    saveScrollPosition (scrollPosition) {
      this.setEpisodeListScrollPosition(scrollPosition)
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() },

    currentProduction () {
      const productionId = this.$route.params.production_id
      if (this.currentProduction.id !== productionId) {
        const newPath = {
          name: 'episodes',
          params: {production_id: this.currentProduction.id}
        }
        this.$refs['episode-search-field'].setValue('')
        this.$store.commit('SET_SEQUENCE_LIST_SCROLL_POSITION', 0)
        this.$router.push(newPath)
        this.loadShots(() => {
          this.computeEpisodeStats()
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
            this.computeEpisodeStats()
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

<style scoped>
.data-list {
  margin-top: 0;
}
</style>
