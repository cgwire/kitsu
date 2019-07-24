<template>
  <div class="sequences page fixed-page">
    <div class="sequence-list-header page-header flexrow">
      <search-field
        class="flexrow-item"
        ref="sequence-search-field"
        @change="onSearchChange"
        placeholder="ex: e01 s01 anim=wip"
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
      <span class="flexrow-item">
        {{ $t('statistics.count_mode') }}
      </span>
      <combobox
        class="mb0 flexrow-item"
        locale-key-prefix="statistics."
        :options="countModeOptions"
        v-model="countMode"
      />
    </div>

    <sequence-list
      ref="sequence-list"
      :count-mode="countMode"
      :display-mode="displayMode"
      :entries="displayedSequences"
      :is-loading="isShotsLoading || initialLoading"
      :is-error="isShotsLoadingError"
      :validation-columns="shotValidationColumns"
      :sequence-stats="sequenceStats"
      :show-all="sequenceSearchText.length === 0"
      @scroll="saveScrollPosition"
    />

    <edit-sequence-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :cancel-route="sequencesPath"
      :sequence-to-edit="sequenceToEdit"
      @confirm="confirmEditSequence"
    />

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('sequences.delete_error')"
      :cancel-route="sequencesPath"
      @confirm="confirmDeleteSequence"
    />

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Combobox from '../widgets/Combobox'
import DeleteModal from '../widgets/DeleteModal'
import EditSequenceModal from '../modals/EditSequenceModal'
import SearchField from '../widgets/SearchField'
import SequenceList from '../lists/SequenceList.vue'

export default {
  name: 'sequences',

  components: {
    Combobox,
    DeleteModal,
    EditSequenceModal,
    SearchField,
    SequenceList
  },

  data () {
    return {
      countMode: 'count',
      displayMode: 'pie',
      initialLoading: true,
      sequenceToDelete: null,
      sequenceToEdit: null,
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
      loading: {
        edit: false,
        del: false
      },
      modals: {
        isNewDisplayed: false,
        isDeleteDisplayed: false
      }
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'displayedSequences',
      'isCurrentUserManager',
      'isShotsLoading',
      'isShotsLoadingError',
      'isTVShow',
      'sequences',
      'sequenceMap',
      'sequencesPath',
      'sequenceStats',
      'sequenceSearchText',
      'sequenceListScrollPosition',
      'shotValidationColumns'
    ])
  },

  mounted () {
    setTimeout(() => {
      this.initSequences()
        .then(this.handleModalsDisplay)
        .then(this.resizeHeaders)
        .then(() => {
          this.initialLoading = false
        })
      this.setDefaultSearchText()
      this.setDefaultListScrollPosition()
    }, 100)
  },

  methods: {
    ...mapActions([
      'computeSequenceStats',
      'deleteSequence',
      'editSequence',
      'hideAssignations',
      'initSequences',
      'loadComment',
      'setLastProductionScreen',
      'setSequenceSearch',
      'setSequenceListScrollPosition',
      'showAssignations'
    ]),

    setDefaultSearchText () {
      if (this.sequenceSearchText.length > 0) {
        this.$refs['sequence-search-field'].setValue(this.sequenceSearchText)
      }
    },

    setDefaultListScrollPosition () {
      if (this.$refs['sequence-list']) {
        this.$refs['sequence-list'].setScrollPosition(
          this.sequenceListScrollPosition
        )
      }
    },

    navigateToList () {
      this.$router.push(this.sequencesPath)
    },

    confirmEditSequence (form) {
      this.loading.edit = true
      this.errors.edit = false

      this.editSequence(form)
        .then(() => {
          this.loading.edit = false
          this.resizeHeaders()
          this.navigateToList()
        }).catch(() => {
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    confirmDeleteSequence () {
      this.loading.del = true
      this.deleteSequence(this.sequenceToDelete)
        .then(() => {
          this.loading.del = false
          this.resizeHeaders()
          this.navigateToList()
        }).catch(() => {
          this.loading.del = false
          this.errors.del = true
        })
    },

    resetEditModal () {
      const form = {
        name: ''
      }
      if (this.sequences.length > 0) {
        form.sequence_id = this.sequences[0].id
      }
      if (this.openProductions.length > 0) {
        form.production_id = this.openProductions[0].id
      }
      this.sequenceToEdit = form
    },

    deleteText () {
      const sequence = this.sequenceToDelete
      if (sequence) {
        return this.$t('sequences.delete_text', { name: sequence.name })
      } else {
        return ''
      }
    },

    handleModalsDisplay () {
      const path = this.$store.state.route.path
      const sequenceId = this.$store.state.route.params.sequence_id
      this.errors = {
        edit: false,
        delete: false
      }

      this.modals = {
        isNewDisplayed: false,
        isDeleteDisplayed: false
      }

      if (path.indexOf('edit') > 0) {
        this.sequenceToEdit = this.sequenceMap[sequenceId]
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        this.sequenceToDelete = this.sequenceMap[sequenceId]
        this.modals.isDeleteDisplayed = true
      }
    },

    onSearchChange (event) {
      const searchQuery = this.$refs['sequence-search-field'].getValue()
      this.setSequenceSearch(searchQuery)
    },

    saveScrollPosition (scrollPosition) {
      this.setSequenceListScrollPosition(scrollPosition)
    },

    resizeHeaders () {
      setTimeout(() => {
        if (this.$refs['sequence-list']) {
          this.$refs['sequence-list'].resizeHeaders()
        }
      }, 0)
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() },

    currentProduction () {
      this.$refs['sequence-search-field'].setValue('')
      this.$store.commit('SET_SEQUENCE_LIST_SCROLL_POSITION', 0)

      if (!this.isTVShow) {
        this.initSequences()
          .then(this.handleModalsDisplay)
          .then(this.resizeHeaders)
      }
    },

    currentEpisode () {
      if (this.isTVShow && this.currentEpisode) {
        this.initSequences()
          .then(this.handleModalsDisplay)
          .then(this.resizeHeaders)
          .then(() => {
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
            this.computeSequenceStats()
          }
        })
      }
    }
  },

  metaInfo () {
    if (this.isTVShow) {
      return {
        title: `${this.currentProduction ? this.currentProduction.name : ''}` +
               ` - ${this.currentEpisode ? this.currentEpisode.name : ''}` +
               ` | ${this.$t('sequences.title')} - Kitsu`
      }
    } else {
      return {
        title: `${this.currentProduction ? this.currentProduction.name : ''}` +
               ` ${this.$t('sequences.title')} - Kitsu`
      }
    }
  }

}
</script>

<style lang="scss" scoped>
.mb0 {
  margin-bottom: 0;
}
</style>
