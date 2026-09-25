<template>
  <div class="wrapper">
    <div class="thumbnail-column">
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
          :preview-file-status="previewFile.status"
          :title="originalName"
          v-if="hasThumbnail"
        />
        <span :title="originalName" v-else> .{{ previewFile.extension }} </span>
        <span
          class="preview-status"
          :class="{ pointer: canValidate }"
          :title="previewFile.validation_status"
          :data-status="previewFile.validation_status"
          role="button"
          tabindex="0"
          @click.stop="canValidate && emit('validation-status-clicked')"
          @keydown.enter.stop.prevent="
            canValidate && emit('validation-status-clicked')
          "
        ></span>
      </div>
      <div class="preview-name" :title="originalName">
        {{ previewFile.original_name }}
      </div>
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
  canValidate: {
    default: false,
    type: Boolean
  },
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

const emit = defineEmits([
  'preview-dropped',
  'selected',
  'validation-status-clicked'
])

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
  // Cancel the drop (onDragover made us a valid target for ANY drag,
  // including OS files, whose default action replaces the page) and
  // ignore payloads that don't come from the reorder strip.
  event.preventDefault()
  dropArea.value.style.background = 'transparent'
  dropArea.value.style.width = '15px'
  const previousIndex = event.dataTransfer.getData('previewIndex')
  if (previousIndex === '') return
  emit('preview-dropped', {
    previousIndex,
    newIndex: props.index
  })
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  align-items: stretch;
}

.preview-name {
  color: $light-grey;
  font-size: 0.8em;
  max-width: 156px;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drop-area {
  width: 15px;
  transition: width 0.3s ease;
}

.revision-preview {
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

  .preview-status {
    background: #aaa;
    border: 2px solid $grey;
    border-radius: 50%;
    height: 16px;
    position: absolute;
    right: 4px;
    top: 4px;
    width: 16px;

    &[data-status='validated'] {
      background: $light-green;
    }
    &[data-status='rejected'] {
      background: $red;
    }
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
