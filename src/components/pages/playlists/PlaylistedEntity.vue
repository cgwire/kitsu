<template>
<div class="flexrow wrapper">
  <drag @drag="onDragged" :transfer-data="entity.id">
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
          v-if="isCurrentUserManager"
        >
          <x-icon />
        </span>
        <light-entity-thumbnail
          width="150px"
          height="103px"
          :preview-file-id="previewFileId"
        />
      </div>

      <div class="entity-title">
        {{ entity.parent_name }} / {{ entity.name }}
      </div>

      <div
        class="preview-choice"
        v-if="taskTypeOptions.length > 0"
      >
        <combobox
          ref="task-type-combobox"
          :thin="true"
          :options="taskTypeOptions"
          v-model="taskTypeId"
        />
        <combobox
          class="version-combo"
          :thin="true"
          :options="previewFileOptions"
          v-model="previewFileId"
        />
      </div>
      <div v-else>
        {{ $t('playlists.no_preview') }}
      </div>
    </div>
  </drag>
  <drop @drop="onDropped">
    <div class="drop-area" ref="drop-area"></div>
  </drop>
</div>
</template>

<script>
/*
 * Widget to describe an entity listed in a playlist. It allows to select a
 * given prevision for a given task type for current entity.
 * It fires events about drag'n'drop reordering too.
 */
import firstBy from 'thenby'
import { mapGetters } from 'vuex'
import { XIcon } from 'vue-feather-icons'

import Combobox from '../../widgets/Combobox'
import LightEntityThumbnail from '../../widgets/LightEntityThumbnail'

export default {
  name: 'playlisted-entity',

  components: {
    Combobox,
    LightEntityThumbnail,
    XIcon
  },

  data () {
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

  mounted () {
    this.setCurrentParameters()
    this.setListeners()
  },

  computed: {
    ...mapGetters([
      'taskTypeMap',
      'isCurrentUserManager'
    ]),

    dropArea () {
      return this.$refs['drop-area']
    },

    taskTypeOptions () {
      return this.entity.preview_files ? Object
        .keys(this.entity.preview_files)
        .map(id => this.taskTypeMap[id])
        .sort(firstBy('priority', 1).thenBy('name'))
        .map((taskType) => {
          return {
            label: taskType.name,
            value: taskType.id
          }
        }) : []
    },

    previewFileOptions () {
      const previewFiles = this.entity.preview_files[this.taskTypeId] || []
      return previewFiles.map(previewFile => ({
        label: `v${previewFile.revision}`,
        value: previewFile.id
      }))
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
    },

    onPlayClick () {
      this.$emit('play-click', this.index)
    },

    onRemoveClick (event) {
      event.preventDefault()
      event.stopPropagation()
      this.$emit('remove-entity', this.entity)
    },

    setListeners () {
      this.dropArea.addEventListener('dragover', this.onDragover)
      this.dropArea.addEventListener('dragleave', this.onDragleave)
    },

    onDragged () {
    },

    onDragleave () {
      this.dropArea.style.background = 'transparent'
      this.dropArea.style.width = '15px'
    },

    onDragover () {
      this.dropArea.style.width = '60px'
    },

    onDropped (entityId) {
      this.dropArea.style.background = 'transparent'
      this.dropArea.style.width = '15px'
      this.$emit('entity-dropped', {
        before: this.entity.id,
        after: entityId
      })
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
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  align-items: stretch;
}

.drop-area {
  width: 15px;
  height: 100%;
  transition: width 0.3s ease;
}

.playlisted-entity {
  border-top: 3px solid transparent;
  border-radius: 5px;
  border: 1px solid dark;
  box-shadow: 2px 2px 2px $dark-grey-strong;
  background: $dark-grey-lighter;
  display: flex;
  flex-direction: column;
  min-width: 150px;
  padding: 4px 4px;

  &.playing {
    border-top: 3px solid $green;
  }
}

.entity-title {
  margin-bottom: 0.6em;
}

.thumbnail-wrapper {
  position: relative;
  cursor: pointer;

  img {
    border-radius: 5px;
  }
}

.field {
  margin-bottom: 0em;
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
  z-index: 100;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  svg {
    width: 10px;
    height: 10px;
  }
}
</style>
