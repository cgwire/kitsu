<template>
  <div class="task-types page fixed-page">

    <list-page-header
      :title="$t('task_types.title')"
      :new-entry-label="$t('task_types.new_task_type')"
      @new-clicked="onNewClicked"
    />

    <task-type-list
      :entries="taskTypes"
      :is-loading="loading.taskTypes"
      :is-error="errors.taskTypes"
      @update-priorities="updatePriorities"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-task-type-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :entries="taskTypes"
      :task-type-to-edit="taskTypeToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditTaskType"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('task_types.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteTaskType"
    />

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import func from '../../lib/func'
import DeleteModal from '../modals/DeleteModal'
import EditTaskTypeModal from '../modals/EditTaskTypeModal'
import ListPageHeader from '../widgets/ListPageHeader'
import TaskTypeList from '../lists/TaskTypeList'

export default {
  name: 'task-types',

  components: {
    DeleteModal,
    EditTaskTypeModal,
    ListPageHeader,
    TaskTypeList
  },

  data () {
    return {
      errors: {
        taskTypes: false,
        edit: false,
        del: false
      },
      loading: {
        taskTypes: false,
        edit: false,
        del: false
      },
      modals: {
        del: false,
        edit: false
      },
      taskTypeToDelete: { color: '#999999' },
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
      this.loading.edit = true
      this.errors.edit = false
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

    updatePriorities (forms) {
      forms.forEach((form) => {
        this.$store.commit('EDIT_TASK_TYPE_END', form)
      })
      this.savePriorities(forms)
    },

    savePriorities (forms) {
      const now = new Date().getTime()
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 1000 && !this.isSaving) {
        this.lastCall = now
        this.isSaving = true
        func.runPromiseMapAsSeries(forms, this.editTaskType)
          .then(() => {
            this.isSaving = false
            if (this.newSaveCall) this.savePriorities(forms)
          })
      } else {
        this.newSaveCall = true
      }
    },

    confirmDeleteTaskType () {
      this.loading.del = true
      this.errors.del = false
      this.deleteTaskType(this.taskTypeToDelete)
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
      const taskType = this.taskTypeToDelete
      if (taskType) {
        return this.$t('task_types.delete_text', { name: taskType.name })
      } else {
        return ''
      }
    },

    onDeleteClicked (taskType) {
      this.taskTypeToDelete = taskType
      this.modals.del = true
    },

    onEditClicked (taskType) {
      this.taskTypeToEdit = taskType
      this.modals.edit = true
    },

    onNewClicked () {
      this.taskTypeToEdit = { color: '#999999' }
      this.modals.edit = true
    }
  },

  watch: {
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
