<template>
  <div class="flexrow">
    <combobox-styled
      ref="task-type-combobox"
      class="flexrow-item"
      :options="taskTypeOptions"
      v-model="taskTypeId"
      v-if="taskTypeOptions.length > 0"
    />

    <combobox-styled
      class="flexrow-item"
      :options="previewFileOptions"
      v-if="previewFileOptions.length"
      v-model="previewFileId"
    />
    <span class="text flexrow-item" v-else>Selected task has no previews.</span>

    <div class="flexrow-item" v-if="taskStatus">
      <validation-tag
        class="flexrow-item"
        :task="{ task_status_id: taskStatus.id }"
        :is-static="true"
        :thin="false"
      />
    </div>
  </div>
</template>

<script>
/*
 * Widget displaying entity's revisions of previews per task type.
 * It allows to select a given revision for a given task type for current entity.
 */
import { firstBy } from 'thenby'
import { mapGetters } from 'vuex'

import editStore from '@/store/modules/edits'

import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

export default {
  name: 'previews-per-task-type',

  components: {
    ComboboxStyled,
    ValidationTag
  },

  emits: ['preview-changed'],

  data() {
    return {
      taskTypeId: null,
      previewFileId: this.entity.preview_file_id
    }
  },

  props: {
    index: {
      default: 0,
      type: Number
    },
    entity: {
      default: () => {},
      type: Object
    }
  },

  mounted() {
    this.setCurrentParameters()
  },

  computed: {
    ...mapGetters([
      'taskMap',
      'taskTypeMap',
      'taskStatusMap',
      'isCurrentUserManager'
    ]),

    taskTypeOptions() {
      const entity = editStore.cache.editMap.get(this.entity.id)
      return entity.tasks
        .map(taskId => this.taskMap.get(taskId))
        .map(task => this.taskTypeMap.get(task.task_type_id))
        .sort(firstBy('priority', 1).thenBy('name'))
        .map(taskType => {
          return {
            label: taskType.name,
            value: taskType.id
          }
        })
    },

    previewFileOptions() {
      const previewFiles = this.entity.preview_files[this.taskTypeId] || []
      return previewFiles.map(previewFile => ({
        label: `v${previewFile.revision}`,
        value: previewFile.id
      }))
    },

    taskStatus() {
      if (!editStore.cache.editMap) return ''

      const entity = editStore.cache.editMap.get(this.entity.id)
      if (!entity) return ''

      const taskId = entity.validations.get(this.taskTypeId)
      if (taskId) {
        const task = this.taskMap.get(taskId)
        if (!task) return ''
        const taskStatus = this.taskStatusMap.get(task.task_status_id)
        return taskStatus
      } else {
        return ''
      }
    }
  },

  methods: {
    getTaskTypeIdForPreviewFile(taskTypeIds, previewFileId) {
      return taskTypeIds.find(taskTypeId => {
        const previewFiles = this.entity.preview_files[taskTypeId]
        return previewFiles.some(previewFile => {
          return previewFile.id === previewFileId
        })
      })
    },

    setCurrentParameters() {
      // Find task type matching current preview.
      const taskTypeIds = Object.keys(this.entity.preview_files)
      if (taskTypeIds.length > 0) {
        if (this.entity.preview_file_id) {
          this.taskTypeId = this.getTaskTypeIdForPreviewFile(
            taskTypeIds,
            this.entity.preview_file_id
          )
        }
        if (!this.taskTypeId) {
          this.taskTypeId = taskTypeIds[0]
        }
      }
    }
  },

  watch: {
    taskTypeId() {
      // Set current preview was last preview selected. If there is no preview
      // matching this task type, it selects the first preview available for
      // this task type.
      const previewFiles = this.entity.preview_files[this.taskTypeId]
      if (previewFiles && previewFiles.length > 0) {
        const isPreviewFile = previewFiles.some(previewFile => {
          return previewFile.id === this.entity.preview_file_id
        })
        if (isPreviewFile) {
          this.previewFileId = this.entity.preview_file_id
        } else {
          this.previewFileId = previewFiles[0].id
        }
      } else {
        this.previewFileId = null
      }
    },

    previewFileId() {
      let previewFile = null
      const previewFiles = this.entity.preview_files[this.taskTypeId]
      if (previewFiles && previewFiles.length > 0) {
        previewFile = previewFiles.find(previewFile => {
          return previewFile.id === this.previewFileId
        })
      }
      this.$emit('preview-changed', this.entity, previewFile)
    },

    'entity.preview_file_id': function () {
      if (this.previewFileId !== this.entity.preview_file_id) {
        this.previewFileId = this.entity.preview_file_id
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.field {
  margin-bottom: 0;
}
.text {
  color: var(--text);
}
</style>
