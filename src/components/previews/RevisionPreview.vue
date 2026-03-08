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
        :title="originalName"
        v-if="hasThumbnail"
      />
      <span :title="originalName" v-else> .{{ previewFile.extension }} </span>
    </div>
    <div
      ref="dropArea"
      class="drop-area"
      @dragover="onDragover"
      @dragleave="onDragleave"
      @drop="onDropped"
    ></div>
  </div>
</template>

<script setup>
/*
 * Widget to display a preview listed in a revision. It allows to select a
 * given file for current revision.
 * It fires events about drag'n'drop reordering too.
 */
import { computed, ref } from 'vue'

import LightEntityThumbnail from '@/components/widgets/LightEntityThumbnail.vue'

const props = defineProps({
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
})

const emit = defineEmits(['preview-dropped', 'selected'])

const dropArea = ref(null)

const hasThumbnail = computed(() =>
  ['mp4', 'png'].includes(props.previewFile.extension)
)

const originalName = computed(
  () => `${props.previewFile.original_name}.${props.previewFile.extension}`
)

const onSelected = () => {
  emit('selected', props.index)
}

const onPreviewDragStart = (event, previewIndex) => {
  event.dataTransfer.setData('previewIndex', previewIndex)
}

const onDragleave = () => {
  dropArea.value.style.background = 'transparent'
  dropArea.value.style.width = '15px'
}

const onDragover = event => {
  event.preventDefault()
  dropArea.value.style.width = '60px'
}

const onDropped = event => {
  dropArea.value.style.background = 'transparent'
  dropArea.value.style.width = '15px'
  emit('preview-dropped', {
    previousIndex: event.dataTransfer.getData('previewIndex'),
    newIndex: props.index
  })
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
