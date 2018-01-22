<template>
  <div class="task-status page fixed-page">
    <div class="level page-header">
      <div class="level-left">
        <page-title :text="$t('task_status.title')"></page-title>
      </div>
      <div class="level-right">
        <div class="level-item">
          <button-link
            class="level-item"
            icon="plus"
            :text="$t('task_status.new_task_status')"
            path="/task-status/new"
          >
          </button-link>
        </div>
      </div>
    </div>

    <task-status-list
      :entries="taskStatus"
      :is-loading="taskStatusList.isLoading"
      :is-error="taskStatusList.isError"
    ></task-status-list>

    <edit-task-status-modal
      :active="modals.isNewDisplayed"
      :is-loading="editStatus.isLoading"
      :is-error="editStatus.isError"
      :cancel-route="'/task-status'"
      :task-status-to-edit="taskStatusToEdit"
      @confirm="confirmEditTaskStatus"
    >
    </edit-task-status-modal>

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="deleteStatus.isLoading"
      :is-error="deleteStatus.isError"
      :cancel-route="'/task-status'"
      :text="deleteText()"
      :error-text="$t('task_status.delete_error')"
      @confirm="confirmDeleteTaskStatus"
    >
    </delete-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TaskStatusList from './lists/TaskStatusList'
import EditTaskStatusModal from './modals/EditTaskStatusModal'
import PageTitle from './widgets/PageTitle'
import DeleteModal from './widgets/DeleteModal'
import ButtonLink from './widgets/ButtonLink'

export default {
  name: 'task-status',

  components: {
    ButtonLink,
    DeleteModal,
    EditTaskStatusModal,
    PageTitle,
    TaskStatusList
  },

  data () {
    return {
      taskStatusToDelete: null,
      taskStatusToEdit: null,
      modals: {
        isNewDisplayed: false,
        isDeleteDisplayed: false
      },
      taskStatusList: {
        isLoading: false,
        isError: false
      },
      editStatus: {
        isLoading: false,
        isError: false
      },
      deleteStatus: {
        isLoading: false,
        isError: false
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
    this.handleModalsDisplay()
  },

  methods: {
    ...mapActions([
      'loadTaskStatus',
      'deleteTaskStatus'
    ]),

    confirmEditTaskStatus (form) {
      const isNew = !(this.taskStatusToEdit && this.taskStatusToEdit.id)
      let action = 'newTaskStatus'
      if (!isNew) {
        action = 'saveTaskStatus'
        form.id = this.taskStatusToEdit.id
      }

      this.editStatus.isLoading = true
      this.editStatus.isError = false
      this.$store.dispatch(action, {
        form: form,
        callback: (err) => {
          this.editStatus.isLoading = false
          if (err) {
            this.editStatus.isError = true
          } else {
            this.$router.push('/task-status') // Close modal
          }
        }
      })
    },

    confirmDeleteTaskStatus () {
      this.deleteStatus.isLoading = true
      this.deleteStatus.isError = false
      this.deleteTaskStatus({
        taskStatus: this.taskStatusToDelete,
        callback: (err) => {
          this.deleteStatus.isLoading = false
          if (err) {
            this.deleteStatus.isError = true
          } else {
            this.$router.push('/task-status') // Close modal
          }
        }
      })
    },

    deleteText () {
      const taskStatus = this.taskStatusToDelete
      if (taskStatus) {
        return this.$t('task_status.delete_text', {name: taskStatus.name})
      } else {
        return ''
      }
    },

    handleModalsDisplay () {
      const path = this.$store.state.route.path
      const taskStatusId = this.$store.state.route.params.task_status_id

      if (path.indexOf('new') > 0) {
        this.taskStatusToEdit = {color: '#000000'}
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('edit') > 0) {
        this.taskStatusToEdit = this.taskStatusMap[taskStatusId]
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        this.taskStatusToDelete = this.taskStatusMap[taskStatusId]
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
      title: `${this.$t('task_status.title')} - Kitsu`
    }
  }
}
</script>

<style scoped>
</style>
