<template>
<div class="flexrow">

  <div class="flexrow-item">
    <div
      class="preview-choice"
      v-if="taskTypeOptions.length > 0"
    >
      <combobox
        ref="task-type-combobox"
        :thin="true"
        :width="150"
        :options="taskTypeOptions"
        v-model="taskTypeId"
      />
    </div>
  </div>

  <div class="flexrow-item">
    <combobox
      class="version-combo"
      :thin="true"
      :width="150"
      :options="previewFileOptions"
      v-if="previewFileOptions.length"
      v-model="previewFileId"
    />
    <span class="text" v-else>Selected task has no previews.</span>
  </div>

  <div class="flexrow-item" v-if="taskStatus">
    <validation-tag
      class="flexrow-item"
      :task="{ task_status_id: taskStatus.id}"
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
import firstBy from 'thenby'
import { mapGetters } from 'vuex'

import Combobox from '../widgets/Combobox'
import ValidationTag from '@/components/widgets/ValidationTag'

export default {
  name: 'previews-per-task-type',

  components: {
    Combobox,
    ValidationTag
  },

  data () {
    return {
      taskTypeId: null,
      previewFileId: this.entity.preview_file_id
    }
  },

  props: {
    entityMap: {
      default: () => {},
      type: Map
    },
    index: {
      default: 0,
      type: Number
    },
    entity: {
      default: () => {},
      type: Object
    }
  },

  mounted () {
    this.setCurrentParameters()
  },

  computed: {
    ...mapGetters([
      'taskMap',
      'taskTypeMap',
      'taskStatusMap',
      'isCurrentUserManager'
    ]),

    taskTypeOptions () {
      const entity = this.entityMap.get(this.entity.id)
      return entity.tasks
        .map(taskId => this.taskMap.get(taskId))
        .map(task => this.taskTypeMap.get(task.task_type_id))
        .sort(firstBy('priority', 1).thenBy('name'))
        .map((taskType) => {
          return {
            label: taskType.name,
            value: taskType.id
          }
        })
    },

    previewFileOptions () {
      const previewFiles = this.entity.preview_files[this.taskTypeId] || []
      return previewFiles.map(previewFile => ({
        label: `v${previewFile.revision}`,
        value: previewFile.id
      }))
    },

    taskStatus () {
      if (!this.entityMap) return ''

      const entity = this.entityMap.get(this.entity.id)
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
    getTaskTypeIdForPreviewFile (taskTypeIds, previewFileId) {
      return taskTypeIds.find((taskTypeId) => {
        const previewFiles = this.entity.preview_files[taskTypeId]
        return previewFiles.some(previewFile => {
          return previewFile.id === previewFileId
        })
      })
    },

    setCurrentParameters () {
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
    taskTypeId () {
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

    previewFileId () {
      let previewFile = null
      const previewFiles = this.entity.preview_files[this.taskTypeId]
      if (previewFiles && previewFiles.length > 0) {
        previewFile = previewFiles.find(previewFile => {
          return previewFile.id === this.previewFileId
        })
      }
      this.$emit('preview-changed', this.entity, previewFile)
    },

    'entity.preview_files': function () {
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
  margin-bottom: 0em;
}

.version-combo {
  margin-top: 0.1em;
}
.text {
  color: var(--text);
}
</style>
