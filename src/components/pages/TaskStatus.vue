<template>
  <div class="task-status page fixed-page">
    <list-page-header
      :title="$t('task_status.library_title')"
      :new-entry-label="$t('task_status.new_task_status')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <route-tabs :active-tab="entityTab" :tabs="entityTabs" route-key="entity" />

    <div class="column">
      <task-status-list
        :entries="taskStatusList"
        :is-loading="loading.list"
        :is-error="errors.list"
        @edit-clicked="onEditClicked"
        @delete-clicked="onDeleteClicked"
        @update-priorities="updatePriorities"
        v-if="entityTab === 'entities'"
      />
      <task-status-list
        :entries="conceptStatusList"
        :is-loading="loading.list"
        :is-error="errors.list"
        @edit-clicked="onEditClicked"
        @delete-clicked="onDeleteClicked"
        @update-priorities="updatePriorities"
        v-if="entityTab === 'concepts'"
      />
    </div>

    <edit-task-status-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :task-status-to-edit="taskStatusToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditTaskStatus"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('task_status.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteTaskStatus"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditTaskStatusModal from '@/components/modals/EditTaskStatusModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import TaskStatusList from '@/components/lists/TaskStatusList.vue'

export default {
  name: 'task-status',

  components: {
    DeleteModal,
    EditTaskStatusModal,
    ListPageHeader,
    RouteTabs,
    TaskStatusList
  },

  data() {
    return {
      activeTab: 'active',
      entityTab: 'entities',
      entityTabs: [
        {
          name: 'entities',
          label: this.$t('entities.title')
        },
        {
          name: 'concepts',
          label: this.$t('concepts.title')
        }
      ],
      taskStatusToDelete: null,
      taskStatusToEdit: { color: '#000000' },
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
      ]
    }
  },

  mounted() {
    this.activeTab = this.$route.query.tab || 'active'
    this.entityTab = this.$route.query.entity || 'entities'
  },

  computed: {
    ...mapGetters(['archivedTaskStatus', 'taskStatus']),

    isActiveTab() {
      return this.activeTab === 'active'
    },

    activeTaskStatuses() {
      return this.isActiveTab ? this.taskStatus : this.archivedTaskStatus
    },

    taskStatusList() {
      return this.activeTaskStatuses
        .filter(taskStatus => !taskStatus.for_concept)
        .sort((a, b) => a.priority - b.priority)
    },

    conceptStatusList() {
      return this.activeTaskStatuses
        .filter(taskStatus => taskStatus.for_concept)
        .sort((a, b) => a.priority - b.priority)
    }
  },

  methods: {
    ...mapActions(['deleteTaskStatus', 'updateTaskStatusPriority']),

    async updatePriorities(taskStatuses) {
      for (const taskStatus of taskStatuses) {
        await this.updateTaskStatusPriority(taskStatus)
      }
    },

    confirmEditTaskStatus(form) {
      const isNew = !(this.taskStatusToEdit && this.taskStatusToEdit.id)
      let action = 'newTaskStatus'
      if (!isNew) {
        action = 'saveTaskStatus'
        form.id = this.taskStatusToEdit.id
      }

      this.loading.edit = true
      this.errors.edit = false
      this.$store
        .dispatch(action, form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch(err => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    confirmDeleteTaskStatus() {
      this.loading.del = true
      this.errors.del = false
      this.deleteTaskStatus(this.taskStatusToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.del = false
        })
        .catch(err => {
          console.error(err)
          this.loading.del = false
          this.errors.del = true
        })
    },

    deleteText() {
      const taskStatus = this.taskStatusToDelete
      if (taskStatus) {
        return this.$t('task_status.delete_text', { name: taskStatus.name })
      } else {
        return ''
      }
    },

    onExportClicked() {
      const name = stringHelpers.slugify(this.$t('task_status.title'))
      const headers = [
        this.$t('main.type'),
        this.$t('task_status.fields.name'),
        this.$t('task_status.fields.short_name'),
        this.$t('task_status.fields.description'),
        this.$t('task_status.fields.color'),
        this.$t('task_status.fields.is_default'),
        this.$t('task_status.fields.is_done'),
        this.$t('task_status.fields.is_retake'),
        this.$t('task_status.fields.is_artist_allowed'),
        this.$t('task_status.fields.is_client_allowed'),
        this.$t('task_status.fields.is_feedback_request')
      ]
      const entries = [headers].concat(
        this.taskStatus.map(taskStatus => [
          taskStatus.type,
          taskStatus.name,
          taskStatus.short_name,
          taskStatus.description,
          taskStatus.color,
          taskStatus.is_default,
          taskStatus.is_done,
          taskStatus.is_retake,
          taskStatus.is_artist_allowed,
          taskStatus.is_client_allowed,
          taskStatus.is_feedback_request
        ])
      )
      csv.buildCsvFile(name, entries)
    },

    onNewClicked() {
      this.taskStatusToEdit = { color: '#000000' }
      this.modals.edit = true
    },

    onEditClicked(taskStatus) {
      this.taskStatusToEdit = taskStatus
      this.modals.edit = true
    },

    onDeleteClicked(taskStatus) {
      this.taskStatusToDelete = taskStatus
      this.modals.del = true
    }
  },

  watch: {
    $route() {
      this.activeTab = this.$route.query.tab || 'active'
      this.entityTab = this.$route.query.entity || 'entities'
    }
  },

  head() {
    return {
      title: `${this.$t('task_status.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.help-tooltip {
  opacity: 0.5;
  transition: opacity 0.3s ease;
  margin-left: 0.25rem;

  &:hover {
    opacity: 1;
  }
  .icon.is-small {
    vertical-align: baseline;
  }
}
</style>
