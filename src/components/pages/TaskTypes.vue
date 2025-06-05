<template>
  <div class="task-types page fixed-page">
    <list-page-header
      :title="$t('task_types.library_title')"
      :new-entry-label="$t('task_types.new_task_type')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <route-tabs :active-tab="entityTab" :tabs="entityTabs" route-key="entity" />

    <task-type-list
      :entries="listTaskTypes"
      :is-loading="loading.taskTypes || loading.departments"
      :is-error="errors.taskTypes || errors.departments"
      @update-priorities="updatePriorities"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-task-type-modal
      :active="modals.edit"
      :for-entity="forEntity"
      :is-loading="loading.edit"
      :is-error="errors.edit"
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

import csv from '@/lib/csv'
import func from '@/lib/func'
import stringHelpers from '@/lib/string'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditTaskTypeModal from '@/components/modals/EditTaskTypeModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import TaskTypeList from '@/components/lists/TaskTypeList.vue'

export default {
  name: 'task-types',

  components: {
    DeleteModal,
    EditTaskTypeModal,
    ListPageHeader,
    RouteTabs,
    TaskTypeList
  },

  data() {
    return {
      activeTab: 'active',
      entityTab: 'assets',
      errors: {
        taskTypes: false,
        departments: false,
        edit: false,
        del: false
      },
      loading: {
        taskTypes: false,
        departments: false,
        edit: false,
        del: false
      },
      modals: {
        del: false,
        edit: false
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
      entityTabs: [
        {
          name: 'assets',
          label: this.$t('assets.title')
        },
        {
          name: 'shots',
          label: this.$t('shots.title')
        },
        {
          name: 'sequences',
          label: this.$t('sequences.title')
        },
        {
          name: 'episodes',
          label: this.$t('episodes.title')
        },
        {
          name: 'edits',
          label: this.$t('edits.title')
        }
      ],
      taskTypeToDelete: { color: '#999999' },
      taskTypeToEdit: null
    }
  },

  computed: {
    ...mapGetters(['archivedTaskTypes', 'departmentMap', 'taskTypes']),

    forEntity() {
      return stringHelpers.capitalize(
        this.entityTab.substring(0, this.entityTab.length - 1)
      )
    },

    isActiveTab() {
      return this.activeTab === 'active'
    },

    listTaskTypes() {
      const taskTypes = this.isActiveTab
        ? this.taskTypes
        : this.archivedTaskTypes
      const forEntity = this.entityTab.substring(0, this.entityTab.length - 1)
      return taskTypes.filter(
        taskType => taskType.for_entity.toLowerCase() === forEntity
      )
    }
  },

  mounted() {
    this.activeTab = this.$route.query.tab || 'active'
    this.entityTab = this.$route.query.entity || 'assets'
    this.loading.taskTypes = true
    this.errors.taskTypes = false
    this.loading.departments = true
    this.errors.departments = false
    this.loadDepartments()
      .then(() => {
        this.loading.departments = false
      })
      .catch(err => {
        console.error(err)
        this.loading.departments = false
        this.errors.departments = true
      })
    this.loadTaskTypes()
      .then(() => {
        this.loading.taskTypes = false
      })
      .catch(err => {
        console.error(err)
        this.loading.taskTypes = false
        this.errors.taskTypes = true
      })
  },

  methods: {
    ...mapActions([
      'editTaskType',
      'deleteTaskType',
      'loadTaskTypes',
      'loadDepartments'
    ]),

    confirmEditTaskType(form) {
      let action = 'newTaskType'
      if (this.taskTypeToEdit && this.taskTypeToEdit.id) {
        action = 'editTaskType'
        form.id = this.taskTypeToEdit.id
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

    updatePriorities(forms) {
      forms.forEach(form => {
        this.$store.commit('EDIT_TASK_TYPE_END', form)
      })
      this.savePriorities(forms)
    },

    savePriorities(forms) {
      const now = new Date().getTime()
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 1000 && !this.isSaving) {
        this.lastCall = now
        this.isSaving = true
        func.runPromiseMapAsSeries(forms, this.editTaskType).then(() => {
          this.isSaving = false
          if (this.newSaveCall) this.savePriorities(forms)
        })
      } else {
        this.newSaveCall = true
      }
    },

    confirmDeleteTaskType() {
      this.loading.del = true
      this.errors.del = false
      this.deleteTaskType(this.taskTypeToDelete)
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
      const taskType = this.taskTypeToDelete
      if (taskType) {
        return this.$t('task_types.delete_text', { name: taskType.name })
      } else {
        return ''
      }
    },

    onDeleteClicked(taskType) {
      this.taskTypeToDelete = taskType
      this.modals.del = true
    },

    onEditClicked(taskType) {
      this.taskTypeToEdit = taskType
      this.modals.edit = true
    },

    onExportClicked() {
      const name = stringHelpers.slugify(this.$t('task_types.title'))
      const headers = [
        this.$t('main.type'),
        this.$t('task_types.fields.dedicated_to'),
        this.$t('task_types.fields.department'),
        this.$t('task_types.fields.name'),
        this.$t('task_types.fields.description'),
        this.$t('task_types.fields.color'),
        this.$t('task_types.fields.allow_timelog')
      ]
      const entries = [headers].concat(
        this.taskTypes.map(taskType => [
          taskType.type,
          taskType.for_entity,
          this.departmentMap.get(taskType.department_id)?.name,
          taskType.name,
          taskType.description,
          taskType.color,
          taskType.allow_timelog
        ])
      )
      csv.buildCsvFile(name, entries)
    },

    onNewClicked() {
      this.taskTypeToEdit = { color: '#999999' }
      this.modals.edit = true
    }
  },

  watch: {
    $route() {
      this.activeTab = this.$route.query.tab || 'active'
      this.entityTab = this.$route.query.entity || 'assets'
    }
  },

  head() {
    return {
      title: `${this.$t('task_types.title')} - Kitsu`
    }
  }
}
</script>
