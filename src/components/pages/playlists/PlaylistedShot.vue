<template>
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
    X
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

  <div class="preview-choice" v-if="taskTypeOptions.length > 0">
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
    There is no preview
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import firstBy from 'thenby'

import ButtonSimple from '../../widgets/ButtonSimple'
import Combobox from '../../widgets/Combobox'
import EntityThumbnail from '../../widgets/EntityThumbnail'

export default {
  name: 'playlisted-shot',

  components: {
    ButtonSimple,
    Combobox,
    EntityThumbnail
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

  computed: {
    ...mapGetters([
      'taskTypeMap',
      'isCurrentUserManager'
    ]),

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
      if (this.taskTypeId) {
        const previewFiles = this.shot.preview_files[this.taskTypeId]
        if (previewFiles && previewFiles.length > 0) {
          return previewFiles.map((previewFile) => {
            return {
              label: `v${previewFile.revision}`,
              value: previewFile.id
            }
          })
        } else {
          return []
        }
      } else {
        return []
      }
    }
  },

  methods: {
    onPlayClick () {
      this.$emit('play-click', this.index)
    },

    onRemoveClick (event) {
      event.preventDefault()
      event.stopPropagation()
      this.$emit('remove-shot', this.shot)
    }
  },

  mounted () {
    const taskTypeIds = Object.keys(this.shot.preview_files)

    if (taskTypeIds.length > 0) {
      if (this.shot.preview_file_id) {
        this.taskTypeId = taskTypeIds.find((taskTypeId) => {
          const previewFiles = this.shot.preview_files[taskTypeId]
          return previewFiles.find((previewFile) => {
            return previewFile.id === this.shot.preview_file_id
          })
        })
      }

      if (!this.taskTypeId) {
        this.taskTypeId = taskTypeIds[0]
      }
    }
  },

  watch: {
    taskTypeId () {
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

.field {
  margin-bottom: 0;
}

.shot-title {
  margin-bottom: 0.6em;
}

.thumbnail-wrapper {
  position: relative;
}

.remove-button {
  position: absolute;
  border-radius: 2em;
  width: 20px;
  height: 20px;
  right: 0;
  font-size: 10px;
  padding: 0.2em;
  margin: 0.4em;
  background: rgba(0, 0, 0, 0.3);
  text-align: center;
  cursor: pointer;
  z-index: 100;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
}
</style>
