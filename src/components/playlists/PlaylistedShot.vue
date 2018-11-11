<template>
<div
  :class="{
    'playlisted-shot': true,
    playing: isPlaying
  }"
>
  <div @click.prevent="onPlayClick">
    <entity-thumbnail
      class="shot-thumbnail"
      :entity="shot"
      :preview-file-id="previewFileId"
    />
  </div>

  <div class="shot-title">{{ shot.entity_name }}</div>

  <div class="preview-choice">
    <combobox
      :options="taskTypeOptions"
      v-model="taskTypeId"
    />
    <combobox
      :options="previewFileOptions"
      v-model="previewFileId"
    />
  </div>

  <a class="remove-button" @click.prevent="onRemoveClick">
    {{ $t('playlists.remove') }}
  </a>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import Combobox from '../widgets/Combobox'
import EntityThumbnail from '../widgets/EntityThumbnail'

export default {
  name: 'playlisted-shot',

  components: {
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
      'taskTypeMap'
    ]),

    taskTypeOptions () {
      const taskTypeIds = Object.keys(this.shot.preview_files)

      return taskTypeIds.map((taskTypeId) => {
        const taskType = this.taskTypeMap[taskTypeId]
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

    onRemoveClick () {
      this.$emit('remove-click', this.shot)
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
      } else {
        this.taskTypeId = taskTypeIds[0]
      }
    }
  },

  watch: {
    taskTypeId () {
      const previewFiles = this.shot.preview_files[this.taskTypeId]
      if (previewFiles && previewFiles.length > 0) {
        if (!this.previewFileId) {
          this.previewFileId = this.shot.preview_file_id || previewFiles[0].id
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

<style scoped>
.playlisted-shot {
  display: flex;
  flex-direction: column;
  padding-top: 5px;
  border-top: 3px solid transparent;
}

.playlisted-shot.playing {
  border-top: 3px solid #CADFCA;
}

.field {
  margin-bottom: 0.2em;
}

.shot-title {
  margin-bottom: 0.6em;
}

.remove-button {
  margin-top: 0.1em;
  color: #AAA;
  text-align: left;
  font-size: 0.9em
}
</style>
