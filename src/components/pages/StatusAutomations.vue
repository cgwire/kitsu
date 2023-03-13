<template>
  <div class="status-automations page fixed-page">
    <list-page-header
      :title="$t('status_automations.title')"
      :new-entry-label="$t('status_automations.new_status_automation')"
      @new-clicked="onNewClicked"
    />

    <status-automation-list
      :entries="statusAutomations"
      :is-editable="true"
      :is-loading="loading.list"
      :is-error="errors.list"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-status-automation-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :status-automation-to-edit="statusAutomationToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditStatusAutomation"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('status_automations.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteStatusAutomation"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import StatusAutomationList from '@/components/lists/StatusAutomationList'
import DeleteModal from '@/components/modals/DeleteModal'
import EditStatusAutomationModal from '@/components/modals/EditStatusAutomationModal'
import ListPageHeader from '@/components/widgets/ListPageHeader'

export default {
  name: 'status-automations',

  components: {
    DeleteModal,
    EditStatusAutomationModal,
    ListPageHeader,
    StatusAutomationList
  },

  data() {
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
      statusAutomationToDelete: null,
      statusAutomationToEdit: null
    }
  },

  computed: {
    ...mapGetters(['statusAutomations']),

    deleteText() {
      const statusAutomation = this.statusAutomationToDelete
      if (statusAutomation) {
        return this.$t('custom_actions.delete_text', {
          name: statusAutomation.name
        })
      } else {
        return ''
      }
    }
  },

  created() {
    this.loading.list = true
    this.errors.list = false
    this.loadStatusAutomations(err => {
      this.loading.list = false
      if (err) {
        this.errors.list = true
      }
    })
  },

  methods: {
    ...mapActions([
      'deleteStatusAutomation',
      'editStatusAutomation',
      'loadTaskStatuses',
      'loadStatusAutomations',
      'newStatusAutomation'
    ]),

    confirmEditStatusAutomation(form) {
      let action = 'newStatusAutomation'
      if (this.statusAutomationToEdit && this.statusAutomationToEdit.id) {
        action = 'editStatusAutomation'
        form.id = this.statusAutomationToEdit.id
      }

      this.loading.edit = true
      this.errors.edit = false
      this[action](form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch(err => {
          console.error(err)
          this.errors.edit = true
          this.loading.edit = false
        })
    },

    confirmDeleteStatusAutomation() {
      this.loading.del = true
      this.errors.del = false
      this.deleteStatusAutomation(this.statusAutomationToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.del = false
        })
        .catch(err => {
          console.error(err)
          this.errors.del = true
          this.loading.del = false
        })
    },

    onNewClicked() {
      this.statusAutomationToEdit = {}
      this.errors.edit = false
      this.modals.edit = true
    },

    onEditClicked(statusAutomation) {
      this.statusAutomationToEdit = statusAutomation
      this.errors.edit = false
      this.modals.edit = true
    },

    onDeleteClicked(statusAutomation) {
      this.statusAutomationToDelete = statusAutomation
      this.errors.del = false
      this.modals.del = true
    }
  },

  watch: {
    $route() {
      this.handleModalsDisplay()
    }
  },

  metaInfo() {
    return {
      title: `${this.$t('status_automations.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped></style>
