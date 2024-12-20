<template>
  <div class="flexrow wrapper">
    <div
      :class="{
        'playlisted-entity': true,
        playing: isPlaying
      }"
    >
      <div class="thumbnail-wrapper" @click.prevent="onPlayClick">
        <span
          class="remove-button flexrow-item"
          :title="$t('playlists.remove')"
          @click.prevent="onRemoveClick"
          v-if="isCurrentUserManager || isCurrentUserSupervisor"
        >
          <x-icon />
        </span>
        <light-entity-thumbnail
          width="150px"
          height="103px"
          :preview-file-id="previewFileId"
        />
      </div>

      <div
        class="entity-title"
        :title="taskStatus.name"
        :style="{
          'border-bottom': '2px solid ' + taskStatus.color,
          'padding-bottom': '5px'
        }"
        @click.prevent="onPlayClick"
      >
        {{ entity.parent_name }} / {{ entity.name }}
      </div>

      <div class="preview-choice" v-if="taskTypeOptions.length > 0">
        <combobox
          ref="task-type-combobox"
          :thin="true"
          :width="150"
          :options="taskTypeOptions"
          v-model="taskTypeId"
        />
        <combobox
          class="version-combo"
          :thin="true"
          :width="150"
          :options="previewFileOptions"
          v-model="previewFileId"
        />
      </div>
      <div v-else>
        {{ $t('playlists.no_preview') }}
      </div>
    </div>

    <div
      :id="'drop-area-' + entity.id"
      class="drop-area"
      @dragover="onDragover"
      @dragleave="onDragleave"
      @drop="onDropped"
      ref="drop-area"
    ></div>
  </div>
</template>

<script>
/*
 * Widget to describe an entity listed in a playlist. It allows to select a
 * given prevision for a given task type for current entity.
 * It fires events about drag'n'drop reordering too.
 */
import { XIcon } from 'lucide-vue-next'
import firstBy from 'thenby'
import { mapGetters } from 'vuex'

import Combobox from '@/components/widgets/Combobox.vue'
import LightEntityThumbnail from '@/components/widgets/LightEntityThumbnail.vue'

export default {
  name: 'playlisted-entity',

  components: {
    Combobox,
    LightEntityThumbnail,
    XIcon
  },

  emits: ['entity-dropped', 'play-click', 'preview-changed', 'remove-entity'],

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
    isPlaying: {
      default: false,
      type: Boolean
    },
    entity: {
      default: () => {},
      type: Object
    }
  },

  mounted() {
    this.setCurrentParameters()
    this.setListeners()
  },

  computed: {
    ...mapGetters([
      'taskMap',
      'taskTypeMap',
      'taskStatusMap',
      'isCurrentUserManager',
      'isCurrentUserSupervisor'
    ]),

    dropArea() {
      return this.$refs['drop-area']
    },

    taskTypeOptions() {
      return this.entity.preview_files
        ? Object.keys(this.entity.preview_files)
            .map(id => this.taskTypeMap.get(id))
            .sort(firstBy('priority', 1).thenBy('name'))
            .map(taskType => {
              return {
                label: taskType.name,
                value: taskType.id
              }
            })
        : []
    },

    previewFileOptions() {
      const previewFiles = this.entity.preview_files[this.taskTypeId] || []
      return previewFiles.map(previewFile => ({
        label: `v${previewFile.revision}`,
        value: previewFile.id
      }))
    },

    taskStatus() {
      const taskId = this.entity.preview_file_task_id
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
    },

    onPlayClick() {
      this.$emit('play-click', this.index)
    },

    onRemoveClick(event) {
      event.preventDefault()
      event.stopPropagation()
      this.$emit('remove-entity', this.entity)
    },

    setListeners() {},

    onDragged() {},

    onDragleave() {
      this.dropArea.style.width = '15px'
    },

    onDragover(event) {
      event.preventDefault()
      this.dropArea.style.width = '60px'
    },

    onDropped(event) {
      this.dropArea.style.width = '15px'
      this.$emit('entity-dropped', {
        before: this.entity.id,
        after: event.dataTransfer.getData('entityId')
      })
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

    'entity.preview_file_id'() {
      if (this.previewFileId !== this.entity.preview_file_id) {
        this.previewFileId = this.entity.preview_file_id
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  align-items: stretch;
  position: relative;
}

.drop-area {
  width: 15px;
  height: 220px;
  transition: width 0.3s ease;
}

.playlisted-entity {
  border-top: 3px solid transparent;
  border-radius: 5px;
  border: 3px solid transparent;
  box-shadow: 2px 2px 2px $dark-grey-strong;
  background: $dark-grey-lighter;
  display: flex;
  flex-direction: column;
  min-width: 150px;
  padding: 4px 4px;

  &:hover {
    border: 3px solid var(--background-selectable);
  }

  &.playing {
    border: 3px solid $green;
  }
}

.entity-title {
  color: $white;
  cursor: pointer;
  font-size: 0.9em;
  margin-bottom: 0.6em;
  max-width: 150px;
  word-wrap: anywhere;
}

.thumbnail-wrapper {
  position: relative;
  cursor: pointer;

  img {
    border-radius: 5px;
  }
}

.field {
  margin-bottom: 0;
}

.version-combo {
  margin-top: 0.1em;
}

.remove-button {
  position: absolute;
  width: 20px;
  height: 20px;
  right: 0;
  margin: 0.4em;
  border-radius: 2em;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  svg {
    width: 10px;
    height: 10px;
  }
}
</style>
