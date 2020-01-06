<template>
  <div class="task-types page fixed-page">
    <div class="level page-header">
      <div class="level-left">
        <page-title :text="$t('task_types.title')" />
      </div>
      <div class="level-right">
        <div class="level-item">
          <button-link
            class="level-item"
            icon="plus"
            :text="$t('task_types.new_task_type')"
            path="/task-types/new"
          />
        </div>
      </div>
    </div>

    <task-type-list
      :entries="taskTypes"
      :is-loading="loading.taskTypes"
      :is-error="errors.taskTypes"
    />

    <edit-task-type-modal
      :active="modals.isNewDisplayed"
      :is-loading="editTaskType.isLoading"
      :is-error="editTaskType.isError"
      :cancel-route="'/task-types'"
      :task-type-to-edit="taskTypeToEdit"
      @confirm="confirmEditTaskType"
    />

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="deleteTaskType.isLoading"
      :is-error="deleteTaskType.isError"
      :cancel-route="'/task-types'"
      :text="deleteText()"
      :error-text="$t('task_types.delete_error')"
      @confirm="confirmDeleteTaskType"
    />

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ButtonLink from '../widgets/ButtonLink'
import DeleteModal from '../modals/DeleteModal'
import EditTaskTypeModal from '../modals/EditTaskTypeModal'
import PageTitle from '../widgets/PageTitle'
import TaskTypeList from '../lists/TaskTypeList'

export default {
  name: 'task-types',

  components: {
    ButtonLink,
    DeleteModal,
    EditTaskTypeModal,
    PageTitle,
    TaskTypeList
  },

  data () {
    return {
      errors: {
        taskTypes: false
      },
      loading: {
        taskTypes: false
      },
      modals: {
        isNewDisplayed: false,
        isDeleteDisplayed: false
      },
      taskTypeToDelete: null,
      taskTypeToEdit: null
    }
  },

  computed: {
    ...mapGetters([
      'getTaskType',
      'taskTypes'
    ])
  },

  mounted () {
    this.loading.taskTypes = true
    this.errors.taskTypes = false
    this.loadTaskTypes()
      .then(() => {
        this.handleModalsDisplay()
        this.loading.taskTypes = false
      })
      .catch((err) => {
        console.error(err)
        this.loading.taskTypes = false
        this.errors.taskTypes = true
      })
  },

  methods: {
    ...mapActions([
      'editTaskType',
      'deleteTaskType',
      'loadTaskTypes'
    ]),

    confirmEditTaskType (form) {
      let action = 'newTaskType'
      if (this.taskTypeToEdit && this.taskTypeToEdit.id) {
        action = 'editTaskType'
        form.id = this.taskTypeToEdit.id
      }

      this.$store.dispatch(action, form)
        .then(() => {
          this.modals.isNewDisplayed = false
          this.$router.push('/task-types')
        })
    },

    confirmDeleteTaskType () {
      this.deleteTaskType(this.taskTypeToDelete)
        .then(() => {
          this.modals.isDeleteDisplayed = false
        })
    },

    deleteText () {
      const taskType = this.taskTypeToDelete
      if (taskType) {
        return this.$t('task_types.delete_text', { name: taskType.name })
      } else {
        return ''
      }
    },

    handleModalsDisplay () {
      const path = this.$store.state.route.path
      const taskTypeId = this.$store.state.route.params.task_type_id
      if (path.indexOf('new') > 0) {
        this.taskTypeToEdit = { color: '#999999' }
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('edit') > 0) {
        this.taskTypeToEdit = this.getTaskType(taskTypeId)
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        this.taskTypeToDelete = this.getTaskType(taskTypeId)
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
      title: `${this.$t('task_types.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
