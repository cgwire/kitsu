<template>
  <div class="wrapper">
    <div
      class="revision-preview"
      :class="{ selected: isSelected }"
      draggable="true"
      @click.prevent="onSelected"
      @dragstart="onPreviewDragStart($event, index)"
    >
      <light-entity-thumbnail
        width="150px"
        height="103px"
        :preview-file-id="previewFile.id"
        v-if="hasThumbnail"
      />
      <span :title="originalName" v-else> .{{ previewFile.extension }} </span>
    </div>
    <div
      ref="drop-area"
      class="drop-area"
      @dragover="onDragover"
      @dragleave="onDragleave"
      @drop="onDropped"
    ></div>
  </div>
</template>

<script>
/*
 * Widget to display a preview listed in a revision. It allows to select a
 * given file for current revision.
 * It fires events about drag'n'drop reordering too.
 */
import LightEntityThumbnail from '@/components/widgets/LightEntityThumbnail.vue'

export default {
  name: 'revision-preview',

  components: {
    LightEntityThumbnail
  },

  props: {
    index: {
      required: true,
      type: Number
    },
    isSelected: {
      default: false,
      type: Boolean
    },
    previewFile: {
      required: true,
      type: Object
    }
  },

  emits: ['preview-dropped', 'selected'],

  computed: {
    dropArea() {
      return this.$refs['drop-area']
    },

    hasThumbnail() {
      return ['mp4', 'png'].includes(this.previewFile.extension)
    },

    originalName() {
      return `${this.previewFile.original_name}.${this.previewFile.extension}`
    }
  },

  methods: {
    onSelected() {
      this.$emit('selected', this.index)
    },

    onPreviewDragStart(event, previewIndex) {
      event.dataTransfer.setData('previewIndex', previewIndex)
    },

    onDragleave() {
      this.dropArea.style.background = 'transparent'
      this.dropArea.style.width = '15px'
    },

    onDragover(event) {
      event.preventDefault()
      this.dropArea.style.width = '60px'
    },

    onDropped(event) {
      this.dropArea.style.background = 'transparent'
      this.dropArea.style.width = '15px'
      this.$emit('preview-dropped', {
        previousIndex: event.dataTransfer.getData('previewIndex'),
        newIndex: this.index
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  align-items: stretch;
}

.drop-area {
  width: 15px;
  transition: width 0.3s ease;
}

.revision-preview {
  border-top: 3px solid transparent;
  border-radius: 5px;
  border: 3px solid transparent;
  box-shadow: 2px 2px 2px $dark-grey-strong;
  background: $dark-grey-lighter;
  height: 109px;
  min-width: 150px;
  position: relative;
  cursor: pointer;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  &.selected {
    border: 3px solid $green;
  }

  img {
    border-radius: 5px;
    margin: 0;
  }

  span {
    text-align: center;
    font-weight: bold;
    color: $white-grey;
  }
}
</style>
