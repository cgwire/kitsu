<template>
  <div class="status-automations page fixed-page">
    <list-page-header
      :title="$t('status_automations.title')"
      :new-entry-label="$t('status_automations.new_status_automation')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <status-automation-list
      class="status-automation-list"
      :entries="statusAutomationsList"
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

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditStatusAutomationModal from '@/components/modals/EditStatusAutomationModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import StatusAutomationList from '@/components/lists/StatusAutomationList.vue'

export default {
  name: 'status-automations',

  components: {
    DeleteModal,
    EditStatusAutomationModal,
    ListPageHeader,
    RouteTabs,
    StatusAutomationList
  },

  data() {
    return {
      activeTab: 'active',
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
      tabs: [
        {
          name: 'active',
          label: this.$t('main.active')
        },
        {
          name: 'archived',
          label: this.$t('main.archived')
        }
      ],
      statusAutomationToDelete: null,
      statusAutomationToEdit: null
    }
  },

  computed: {
    ...mapGetters([
      'statusAutomations',
      'archivedStatusAutomations',
      'taskStatusMap',
      'taskTypeMap'
    ]),

    isActiveTab() {
      return this.activeTab === 'active'
    },

    statusAutomationsList() {
      return this.isActiveTab
        ? this.statusAutomations
        : this.archivedStatusAutomations
    },

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
    this.activeTab = this.$route.query.tab || 'active'
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

    onExportClicked() {
      const name = stringHelpers.slugify(this.$t('status_automations.title'))
      const headers = [
        this.$t('main.type'),
        this.$t('status_automations.fields.entity_type'),
        this.$t('status_automations.fields.in_task_type'),
        this.$t('status_automations.fields.in_task_status'),
        this.$t('status_automations.fields.out_field_type'),
        this.$t('status_automations.fields.out_task_type'),
        this.$t('status_automations.fields.out_task_status'),
        this.$t('status_automations.fields.import_last_revision')
      ]
      const entries = [headers].concat(
        this.statusAutomations.map(statusAutomation => [
          statusAutomation.type,
          statusAutomation.entity_type,
          this.taskTypeMap.get(statusAutomation.in_task_type_id)?.name,
          this.taskStatusMap.get(statusAutomation.in_task_status_id)
            ?.short_name,
          statusAutomation.out_field_type === 'ready_for'
            ? this.$t('status_automations.change_ready_for')
            : this.$t('status_automations.change_status'),
          this.taskTypeMap.get(statusAutomation.out_task_type_id)?.name,
          statusAutomation.out_field_type === 'status'
            ? this.taskStatusMap.get(statusAutomation.out_task_status_id)
                ?.short_name
            : undefined,
          statusAutomation.import_last_revision
        ])
      )
      csv.buildCsvFile(name, entries)
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
    '$route.query.tab'() {
      this.activeTab = this.$route.query.tab || 'active'
    }
  },

  head() {
    return {
      title: `${this.$t('status_automations.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.status-automation-list {
  margin-top: 0;
}
</style>
