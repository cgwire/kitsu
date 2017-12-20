<template>
  <div class="custom-actions page fixed-page">
    <div class="level page-header">
      <div class="level-left">
        <page-title :text="$t('custom_actions.title')"></page-title>
      </div>
      <div class="level-right">
        <div class="level-item">
          <button-link
            class="level-item"
            icon="plus"
            :text="$t('custom_actions.new_custom_action')"
            path="/custom-actions/new"
          >
          </button-link>
        </div>
      </div>
    </div>

    <custom-action-list
      :entries="customActions"
      :is-loading="isCustomActionsLoading"
      :is-error="isCustomActionsLoadingError"
    ></custom-action-list>

    <edit-custom-action-modal
      :active="modals.isNewDisplayed"
      :is-loading="editCustomAction.isLoading"
      :is-error="editCustomAction.isError"
      :cancel-route="'/custom-actions'"
      :custom-action-to-edit="customActionToEdit"
      @confirm="confirmEditCustomAction"
    >
    </edit-custom-action-modal>

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="deleteCustomAction.isLoading"
      :is-error="deleteCustomAction.isError"
      :cancel-route="'/custom-actions'"
      :text="deleteText()"
      :error-text="$t('custom_actions.delete_error')"
      @confirm="confirmDeleteCustomAction"
    >
    </delete-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CustomActionList from './lists/CustomActionList'
import EditCustomActionModal from './modals/EditCustomActionModal'
import DeleteModal from './widgets/DeleteModal'
import PageTitle from './widgets/PageTitle'
import ButtonLink from './widgets/ButtonLink'

export default {
  name: 'custom-actions',

  components: {
    ButtonLink,
    DeleteModal,
    EditCustomActionModal,
    PageTitle,
    CustomActionList
  },

  data () {
    return {
      modals: {
        isNewDisplayed: false,
        isDeleteDisplayed: false
      },
      customActionToDelete: null,
      customActionToEdit: null
    }
  },

  computed: {
    ...mapGetters([
      'customActions',
      'isCustomActionsLoading',
      'isCustomActionsLoadingError',
      'editCustomAction',
      'deleteCustomAction',
      'customAction'
    ])
  },

  created () {
    this.loadCustomActions((err) => {
      if (!err) this.handleModalsDisplay()
    })
  },

  methods: {
    ...mapActions([
      'loadCustomActions'
    ]),

    confirmEditCustomAction (form) {
      let action = 'newCustomAction'
      if (this.customActionToEdit && this.customActionToEdit.id) {
        action = 'editCustomAction'
        form.id = this.customActionToEdit.id
      }

      this.$store.dispatch(action, {
        data: form,
        callback: (err) => {
          if (!err) {
            this.modals.isNewDisplayed = false
            this.$router.push('/custom-actions')
          }
        }
      })
    },

    confirmDeleteCustomAction () {
      this.$store.dispatch('deleteCustomAction', {
        customAction: this.customActionToDelete,
        callback: (err) => {
          if (!err) this.$router.push('/custom-actions')
        }
      })
    },

    deleteText () {
      const customAction = this.customActionToDelete
      if (customAction) {
        return this.$t('custom_actions.delete_text', {name: customAction.name})
      } else {
        return ''
      }
    },

    handleModalsDisplay () {
      const path = this.$store.state.route.path
      const customActionId = this.$store.state.route.params.custom_action_id

      if (path.indexOf('new') > 0) {
        this.customActionToEdit = {color: '#FFFFFF'}
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('edit') > 0) {
        this.customActionToEdit = this.customAction(customActionId)
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        this.customActionToDelete = this.customAction(customActionId)
        this.modals.isDeleteDisplayed = true
      } else {
        this.modals.isNewDisplayed = false
        this.modals.isDeleteDisplayed = false
      }
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() }
  },

  metaInfo () {
    return {
      title: `${this.$t('custom_actions.title')} - Kitsu`
    }
  }

}
</script>

<style scoped>
</style>
