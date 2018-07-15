<template>
  <div class="sequences page fixed-page">
    <div class="sequence-list-header page-header">
      <div class="level header-title">
        <div class="level-left">
          <page-title :text="$t('sequences.title')"></page-title>
        </div>
      </div>

      <div class="filters-area">
        <search-field
          ref="sequence-search-field"
          @change="onSearchChange"
          placeholder="ex: e01 s01, anim=wip"
        >
        </search-field>
      </div>
    </div>

    <sequence-list
      ref="sequence-list"
      :entries="displayedSequences"
      :is-loading="isShotsLoading"
      :is-error="isShotsLoadingError"
      :validation-columns="shotValidationColumns"
      :sequence-stats="sequenceStats"
      @scroll="saveScrollPosition"
    ></sequence-list>

    <edit-sequence-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :cancel-route="{
        name: 'sequences',
        params: {production_id: currentProduction.id}
      }"
      :sequence-to-edit="sequenceToEdit"
      @confirm="confirmEditSequence"
    >
    </edit-sequence-modal>

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('sequences.delete_error')"
      :cancel-route="{
        name: 'sequences',
        params: {production_id: currentProduction.id}
      }"
      @confirm="confirmDeleteSequence"
    >
    </delete-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { SearchIcon } from 'vue-feather-icons'
import SequenceList from './lists/SequenceList.vue'
import DeleteModal from './widgets/DeleteModal'
import EditSequenceModal from './modals/EditSequenceModal'
import PageTitle from './widgets/PageTitle'
import SearchField from './widgets/SearchField'

export default {
  name: 'sequences',

  components: {
    SequenceList,
    EditSequenceModal,
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
      sequenceToDelete: null,
      sequenceToEdit: null
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'displayedSequences',
      'isCurrentUserManager',
      'isShotsLoading',
      'isShotsLoadingError',
      'sequences',
      'sequenceMap',
      'sequenceStats',
      'sequenceSearchText',
      'sequenceListScrollPosition',
      'shotValidationColumns'
    ])
  },

  created () {
    this.initSequences()
      .then(this.handleModalsDisplay)
  },

  mounted () {
    this.setDefaultSearchText()
    this.setDefaultListScrollPosition()
  },

  methods: {
    ...mapActions([
      'computeSequenceStats',
      'deleteSequence',
      'editSequence',
      'hideAssignations',
      'initSequences',
      'loadShots',
      'loadComment',
      'setLastProductionScreen',
      'setProduction',
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
      this.$refs['sequence-list'].setScrollPosition(
        this.sequenceListScrollPosition
      )
    },

    navigateToList () {
      this.$router.push({
        name: 'sequences',
        params: {production_id: this.currentProduction.id}
      })
    },

    confirmEditSequence (form) {
      this.loading.edit = true
      this.errors.edit = false

      this.editSequence(form)
        .then(() => {
          this.loading.edit = false
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
        return this.$t('sequences.delete_text', {name: sequence.name})
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
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() },

    currentProduction () {
      const productionId = this.$route.params.production_id
      if (this.currentProduction.id !== productionId) {
        const newPath = {
          name: 'sequences',
          params: {production_id: this.currentProduction.id}
        }

        this.$refs['sequence-search-field'].setValue('')
        this.$store.commit('SET_SEQUENCE_LIST_SCROLL_POSITION', 0)

        this.$router.push(newPath)
        this.loadShots(() => {
          this.computeSequenceStats()
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
    return {
      title: `${this.currentProduction.name} ${this.$t('sequences.title')} - Kitsu`
    }
  }

}
</script>

<style scoped>
.data-list {
  margin-top: 0;
}
</style>
