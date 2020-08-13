<template>
  <div class="custom-actions page fixed-page">
    <list-page-header
      :title="$t('custom_actions.title')"
      :new-entry-label="$t('custom_actions.new_custom_action')"
      @new-clicked="onNewClicked"
    />

    <custom-action-list
      :entries="customActions"
      :is-loading="loading.list"
      :is-error="errors.list"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-custom-action-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :custom-action-to-edit="customActionToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditCustomAction"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('custom_actions.delete_error')"
      @cancel="modals.delete = false"
      @confirm="confirmDeleteCustomAction"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CustomActionList from '../lists/CustomActionList'
import DeleteModal from '../modals/DeleteModal'
import EditCustomActionModal from '../modals/EditCustomActionModal'
import ListPageHeader from '@/components/widgets/ListPageHeader'

export default {
  name: 'custom-actions',

  components: {
    CustomActionList,
    DeleteModal,
    EditCustomActionModal,
    ListPageHeader
  },

  data () {
    return {
      modals: {
        edit: false,
        del: false
      },
      loading: {
        edit: false,
        del: false,
        list: false
      },
      errors: {
        edit: false,
        del: false,
        list: false
      },
      customActionToDelete: null,
      customActionToEdit: null
    }
  },

  computed: {
    ...mapGetters([
      'customActions'
    ]),

    deleteText () {
      const customAction = this.customActionToDelete
      if (customAction) {
        return this.$t(
          'custom_actions.delete_text', { name: customAction.name })
      } else {
        return ''
      }
    }
  },

  created () {
    this.loading.list = true
    this.errors.list = false
    this.loadCustomActions((err) => {
      this.loading.list = false
      if (err) {
        this.errors.list = true
      }
    })
  },

  methods: {
    ...mapActions([
      'deleteCustomAction',
      'editCustomAction',
      'loadCustomActions',
      'newCustomAction'
    ]),

    confirmEditCustomAction (form) {
      let action = 'newCustomAction'
      if (this.customActionToEdit && this.customActionToEdit.id) {
        action = 'editCustomAction'
        form.id = this.customActionToEdit.id
      }

      this.loading.edit = true
      this.errors.edit = false
      this[action](form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch((err) => {
          console.error(err)
          this.errors.edit = true
          this.modals.isNewDisplayed = false
        })
    },

    confirmDeleteCustomAction () {
      this.loading.del = true
      this.errors.del = false
      this.deleteCustomAction(this.customActionToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.del = false
        })
        .catch((err) => {
          console.error(err)
          this.errors.del = true
          this.loading.del = false
        })
    },

    onNewClicked () {
      this.customActionToEdit = {}
      this.errors.edit = false
      this.modals.edit = true
    },

    onEditClicked (customAction) {
      this.customActionToEdit = customAction
      this.errors.edit = false
      this.modals.edit = true
    },

    onDeleteClicked (customAction) {
      this.customActionToDelete = customAction
      this.errors.del = false
      this.modals.del = true
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

<style lang="scss" scoped>
</style>
