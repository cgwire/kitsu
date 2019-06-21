<template>
<div class="flexrow wrapper">
  <drag @drag="onDragged" :transfer-data="shot.id">
    <div
      :class="{
        'playlisted-shot': true,
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
        <entity-thumbnail
          class="shot-thumbnail"
          :empty-width="150"
          :empty-height="103"
          :entity="shot"
          :preview-file-id="previewFileId"
        />
      </div>

      <div class="shot-title">{{ shot.sequence_name }} / {{ shot.name }}</div>

      <div
        class="preview-choice"
        v-if="taskTypeOptions.length > 0"
      >
        <div>
          <combobox
            :options="taskTypeOptions"
            :disabled="!isCurrentUserManager"
            v-model="taskTypeId"
          />
        </div>
        <div class="flexrow">
          <combobox
            class="flexrow-item"
            :options="previewFileOptions"
            :disabled="!isCurrentUserManager"
            v-model="previewFileId"
          />
          <span class="filler"></span>
        </div>
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
 * Widget to describe a shot listed in a playlist. It allows to select a given
 * prevision for a given task type for current shot.
 * It fires events about drag'n'drop reordering too.
 */
import firstBy from 'thenby'
import { mapGetters } from 'vuex'
import { XIcon } from 'vue-feather-icons'

import Combobox from '../../widgets/Combobox'
import EntityThumbnail from '../../widgets/EntityThumbnail'

export default {
  name: 'playlisted-shot',

  components: {
    Combobox,
    EntityThumbnail,
    XIcon
  },

  data () {
    return {
      taskTypeId: null,
      previewFileId: this.shot.preview_file_id
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
    shot: {
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
      return Object
        .keys(this.shot.preview_files)
        .map(id => this.taskTypeMap[id])
        .sort(firstBy('priority', -1).thenBy('name'))
        .map((taskType) => {
          return {
            label: taskType.name,
            value: taskType.id
          }
        })
    },

    previewFileOptions () {
      const previewFiles = this.shot.preview_files[this.taskTypeId] || []
      return previewFiles.map(previewFile => ({
        label: `v${previewFile.revision}`,
        value: previewFile.id
      }))
    }
  },

  methods: {
    getTaskTypeIdForPreviewFile (taskTypeIds, previewFileId) {
      return taskTypeIds.find((taskTypeId) => {
        const previewFiles = this.shot.preview_files[taskTypeId]
        return previewFiles.some(previewFile => {
          return previewFile.id === previewFileId
        })
      })
    },

    setCurrentParameters () {
      // Find task type matching current preview.
      const taskTypeIds = Object.keys(this.shot.preview_files)
      if (taskTypeIds.length > 0) {
        if (this.shot.preview_file_id) {
          this.taskTypeId = this.getTaskTypeIdForPreviewFile(
            taskTypeIds,
            this.shot.preview_file_id
          )
        }
        if (!this.taskTypeId) {
          this.taskTypeId = taskTypeIds[0]
        }
      }
    },

    setListeners () {
      this.dropArea.addEventListener('dragover', this.onDragover)
      this.dropArea.addEventListener('dragleave', this.onDragleave)
    },

    onDragged () {
    },

    onDragleave () {
      this.dropArea.style.background = 'transparent'
    },

    onDragover () {
      this.dropArea.style.background = '#00B242'
    },

    onDropped (shotId) {
      this.$refs['drop-area'].style.background = 'transparent'
      this.$emit('shot-dropped', {
        before: this.shot.id,
        after: shotId
      })
    },

    onPlayClick () {
      this.$emit('play-click', this.index)
    },

    onRemoveClick (event) {
      event.preventDefault()
      event.stopPropagation()
      this.$emit('remove-shot', this.shot)
    }
  },

  watch: {
    taskTypeId () {
      // Set current preview was last preview selected. If there is no preview
      // matching this task type, it selects the first preview available for
      // this task type.
      const previewFiles = this.shot.preview_files[this.taskTypeId]
      if (previewFiles && previewFiles.length > 0) {
        const isPreviewFile = previewFiles.some(previewFile => {
          return previewFile.id === this.shot.preview_file_id
        })
        if (isPreviewFile) {
          this.previewFileId = this.shot.preview_file_id
        } else {
          this.previewFileId = previewFiles[0].id
        }
      }
    },

    previewFileId () {
      this.$emit('preview-changed', this.shot, this.previewFileId)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  align-items: stretch;
}

.drop-area {
  width: 10px;
  margin-left: 10px;
  height: 100%;
}

.playlisted-shot {
  border-top: 3px solid transparent;
  display: flex;
  flex-direction: column;
  min-width: 150px;
  padding:0;

  &.playing {
    border-top: 3px solid $green;
  }
}

.shot-title {
  margin-bottom: 0.6em;
}

.thumbnail-wrapper {
  position: relative;
}

.field {
  margin-bottom: 0em;
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
