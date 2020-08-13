<template>
  <div class="task-status page fixed-page">

    <list-page-header
      :title="$t('task_status.title')"
      :new-entry-label="$t('task_status.new_task_status')"
      @new-clicked="onNewClicked"
    />

    <task-status-list
      :entries="taskStatus"
      :is-loading="loading.list"
      :is-error="errors.list"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

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
import DeleteModal from '../modals/DeleteModal'
import EditTaskStatusModal from '../modals/EditTaskStatusModal'
import ListPageHeader from '../widgets/ListPageHeader'
import TaskStatusList from '../lists/TaskStatusList'

export default {
  name: 'task-status',

  components: {
    DeleteModal,
    EditTaskStatusModal,
    ListPageHeader,
    TaskStatusList
  },

  data () {
    return {
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
      }
    }
  },

  computed: {
    ...mapGetters([
      'taskStatus',
      'taskStatusMap'
    ])
  },

  created () {
  },

  methods: {
    ...mapActions([
      'deleteTaskStatus'
    ]),

    confirmEditTaskStatus (form) {
      const isNew = !(this.taskStatusToEdit && this.taskStatusToEdit.id)
      let action = 'newTaskStatus'
      if (!isNew) {
        action = 'saveTaskStatus'
        form.id = this.taskStatusToEdit.id
      }

      this.loading.edit = true
      this.loading.del = false
      this.$store.dispatch(action, form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    confirmDeleteTaskStatus () {
      this.loading.del = true
      this.errors.del = false
      this.deleteTaskStatus(this.taskStatusToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.del = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.del = false
          this.errors.del = true
        })
    },

    deleteText () {
      const taskStatus = this.taskStatusToDelete
      if (taskStatus) {
        return this.$t('task_status.delete_text', { name: taskStatus.name })
      } else {
        return ''
      }
    },

    onNewClicked () {
      this.taskStatusToEdit = { color: '#000000' }
      this.modals.edit = true
    },

    onEditClicked (taskStatus) {
      this.taskStatusToEdit = taskStatus
      this.modals.edit = true
    },

    onDeleteClicked (taskStatus) {
      this.taskStatusToDelete = taskStatus
      this.modals.del = true
    }
  },

  watch: {
  },

  metaInfo () {
    return {
      title: `${this.$t('task_status.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
