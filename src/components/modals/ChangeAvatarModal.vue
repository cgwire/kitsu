<template>
  <base-modal :active="active" :title="title" @cancel="$emit('cancel')">
    <p class="explanation">
      {{ $t('profile.avatar.intro') }}
    </p>

    <div class="preview">
      <input
        ref="fileInputRef"
        class="hidden-input"
        type="file"
        accept=".png,.jpg,.jpeg"
        @change="onFileChange"
      />

      <div
        ref="frameRef"
        class="preview-circle"
        :class="{
          dragging: isDragging,
          'drag-over': isDragOver,
          empty: !previewUrl
        }"
        :tabindex="previewUrl ? -1 : 0"
        @mousedown="onPointerDown"
        @touchstart.passive="onPointerDown"
        @click="onPreviewClick"
        @keydown.enter.prevent="openFilePicker"
        @keydown.space.prevent="openFilePicker"
        @dragenter.prevent="isDragOver = true"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="onDrop"
      >
        <img
          ref="imageRef"
          class="preview-image"
          :src="previewUrl"
          alt=""
          draggable="false"
          :style="imageStyle"
          @load="onImageLoad"
          v-if="previewUrl"
        />
        <div class="preview-placeholder" v-else>
          <upload-icon
            class="placeholder-icon"
            :size="32"
            :stroke-width="1.5"
          />
          <span class="placeholder-text">
            {{ $t('profile.avatar.drop_or_click') }}
          </span>
        </div>
      </div>

      <div class="controls" v-if="previewUrl">
        <div class="zoom-row">
          <span class="zoom-icon" aria-hidden="true">−</span>
          <input
            class="zoom-slider"
            type="range"
            :min="minScale"
            :max="maxScale"
            step="0.001"
            v-model.number="scale"
          />
          <span class="zoom-icon" aria-hidden="true">+</span>
        </div>
        <button class="replace-button" type="button" @click="openFilePicker">
          {{ $t('profile.avatar.replace') }}
        </button>
        <p class="preview-hint">{{ $t('profile.avatar.preview_hint') }}</p>
      </div>
    </div>

    <p class="error" v-if="isError">
      {{ $t('profile.avatar.error_upload') }}
    </p>

    <modal-footer
      :error-text="$t('productions.metadata.error')"
      :is-loading="isLoading"
      :is-disabled="!formData"
      @confirm="onConfirmClicked"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { UploadIcon } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref, toRef, watch } from 'vue'

import { useModal } from '@/composables/modal'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
// eslint-disable-next-line no-unused-vars
import FileUpload from '@/components/widgets/FileUpload.vue'

// Display frame is driven by `.preview-circle` CSS (180px); the canvas
// exports at a higher resolution so the avatar stays sharp on retina.
const FRAME_SIZE = 180
const OUTPUT_SIZE = 400

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  title: { type: String, default: '' }
})

const emit = defineEmits(['cancel', 'confirm', 'fileselected'])

useModal(toRef(props, 'active'), emit)

// State

const fileInputRef = ref(null)
const frameRef = ref(null)
const imageRef = ref(null)
const originalFile = ref(null)
const formData = ref(null)
const previewUrl = ref(null)
const naturalSize = ref({ width: 0, height: 0 })
const scale = ref(1)
const offset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const isDragOver = ref(false)
const dragStart = ref({ pointerX: 0, pointerY: 0, offsetX: 0, offsetY: 0 })

// Computed

const minScale = computed(() => {
  const { width, height } = naturalSize.value
  if (!width || !height) return 1
  return Math.max(FRAME_SIZE / width, FRAME_SIZE / height)
})

const maxScale = computed(() => minScale.value * 4)

const imageStyle = computed(() => {
  const { width, height } = naturalSize.value
  return {
    width: `${width * scale.value}px`,
    height: `${height * scale.value}px`,
    transform: `translate(${offset.value.x}px, ${offset.value.y}px)`
  }
})

// Functions

const clampOffset = (x, y) => {
  const { width, height } = naturalSize.value
  const scaled = { w: width * scale.value, h: height * scale.value }
  const minX = FRAME_SIZE - scaled.w
  const minY = FRAME_SIZE - scaled.h
  return {
    x: Math.min(0, Math.max(minX, x)),
    y: Math.min(0, Math.max(minY, y))
  }
}

const centerOffset = () => {
  const { width, height } = naturalSize.value
  offset.value = {
    x: (FRAME_SIZE - width * scale.value) / 2,
    y: (FRAME_SIZE - height * scale.value) / 2
  }
}

const releasePreview = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

const reset = () => {
  releasePreview()
  formData.value = null
  originalFile.value = null
  naturalSize.value = { width: 0, height: 0 }
  scale.value = 1
  offset.value = { x: 0, y: 0 }
  isDragOver.value = false
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const acceptFile = file => {
  if (!file || !file.type?.startsWith('image/')) return
  releasePreview()
  originalFile.value = file
  const data = new FormData()
  data.append('file', file, file.name)
  formData.value = data
  previewUrl.value = URL.createObjectURL(file)
  emit('fileselected', data)
}

const onFileChange = event => {
  acceptFile(event.target.files?.[0])
}

const onDrop = event => {
  isDragOver.value = false
  acceptFile(event.dataTransfer?.files?.[0])
}

const openFilePicker = () => fileInputRef.value?.click()

const onPreviewClick = event => {
  if (previewUrl.value) return
  if (event.target.closest('.replace-button')) return
  openFilePicker()
}

const onImageLoad = event => {
  naturalSize.value = {
    width: event.target.naturalWidth,
    height: event.target.naturalHeight
  }
  scale.value = minScale.value
  centerOffset()
}

const pointerCoords = event => {
  const touch = event.touches?.[0] || event.changedTouches?.[0]
  return {
    x: touch ? touch.clientX : event.clientX,
    y: touch ? touch.clientY : event.clientY
  }
}

const onPointerDown = event => {
  if (!previewUrl.value) return
  if (event.button !== undefined && event.button !== 0) return
  if (!naturalSize.value.width) return
  isDragging.value = true
  const { x, y } = pointerCoords(event)
  dragStart.value = {
    pointerX: x,
    pointerY: y,
    offsetX: offset.value.x,
    offsetY: offset.value.y
  }
  window.addEventListener('mousemove', onPointerMove)
  window.addEventListener('mouseup', onPointerUp)
  window.addEventListener('touchmove', onPointerMove, { passive: false })
  window.addEventListener('touchend', onPointerUp)
}

const onPointerMove = event => {
  if (!isDragging.value) return
  if (event.cancelable) event.preventDefault()
  const { x, y } = pointerCoords(event)
  offset.value = clampOffset(
    dragStart.value.offsetX + (x - dragStart.value.pointerX),
    dragStart.value.offsetY + (y - dragStart.value.pointerY)
  )
}

const onPointerUp = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
  window.removeEventListener('touchmove', onPointerMove)
  window.removeEventListener('touchend', onPointerUp)
}

const buildCroppedFormData = () =>
  new Promise((resolve, reject) => {
    if (!imageRef.value || !naturalSize.value.width) {
      resolve(formData.value)
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')
    const sourceSize = FRAME_SIZE / scale.value
    const sourceX = -offset.value.x / scale.value
    const sourceY = -offset.value.y / scale.value
    ctx.drawImage(
      imageRef.value,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    )
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Cropping failed'))
          return
        }
        const name = originalFile.value?.name || 'avatar.jpg'
        const file = new File([blob], name, { type: blob.type })
        const data = new FormData()
        data.append('file', file, file.name)
        resolve(data)
      },
      'image/jpeg',
      0.92
    )
  })

const onConfirmClicked = async () => {
  try {
    const cropped = await buildCroppedFormData()
    emit('confirm', cropped)
  } catch (err) {
    console.error(err)
    emit('confirm', formData.value)
  }
}

// Watchers

watch(scale, (value, previous) => {
  if (!naturalSize.value.width) return
  if (!previous || previous === value) {
    offset.value = clampOffset(offset.value.x, offset.value.y)
    return
  }
  const ratio = value / previous
  const centerX = FRAME_SIZE / 2
  const centerY = FRAME_SIZE / 2
  const newX = centerX - (centerX - offset.value.x) * ratio
  const newY = centerY - (centerY - offset.value.y) * ratio
  offset.value = clampOffset(newX, newY)
})

watch(
  () => props.active,
  () => {
    reset()
  }
)

// Lifecycle

onBeforeUnmount(() => {
  releasePreview()
  onPointerUp()
})
</script>

<style lang="scss" scoped>
.explanation {
  color: var(--text-alt);
  margin-bottom: 1.25rem;
  text-align: center;
}

.error {
  color: $red;
  margin-top: 1rem;
  text-align: center;
}

.preview {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hidden-input {
  display: none;
}

.preview-circle {
  background: var(--background-page);
  border: 1px solid var(--border);
  border-radius: 50%;
  cursor: grab;
  height: 180px;
  outline: none;
  overflow: hidden;
  position: relative;
  touch-action: none;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
  user-select: none;
  width: 180px;

  &.dragging {
    cursor: grabbing;
  }

  &.empty {
    border-style: dashed;
    border-width: 2px;
    cursor: pointer;

    &:hover,
    &:focus,
    &.drag-over {
      background: var(--background-hover);
      border-color: $green;
    }
  }
}

.preview-image {
  display: block;
  max-width: none;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}

.preview-placeholder {
  align-items: center;
  color: var(--text-alt);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
  justify-content: center;
  padding: 0 1rem;
  text-align: center;
}

.placeholder-icon {
  color: var(--text-alt);
  opacity: 0.7;
}

.placeholder-text {
  font-size: 0.9rem;
}

.controls {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
  max-width: 260px;
}

.zoom-row {
  align-items: center;
  display: flex;
  gap: 0.6rem;
  width: 100%;
}

.zoom-icon {
  color: var(--text-alt);
  font-size: 1.1rem;
  line-height: 1;
}

.zoom-slider {
  -webkit-appearance: none;
  appearance: none;
  background: var(--border);
  border-radius: 999px;
  flex: 1;
  height: 4px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: $green;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    height: 16px;
    width: 16px;
  }

  &::-moz-range-thumb {
    background: $green;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    height: 16px;
    width: 16px;
  }
}

.replace-button {
  background: none;
  border: none;
  color: $green;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
}

.preview-hint {
  color: var(--text-alt);
  font-size: 0.8rem;
  margin: 0;
  text-align: center;
}
</style>
