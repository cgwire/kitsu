<template>
  <base-modal :active="active" :title="title" @cancel="$emit('cancel')">
    <p class="explanation">
      {{ $t('main.csv.select_file') }}
    </p>

    <file-upload
      ref="uploadAvatarField"
      :label="$t('main.csv.upload_file')"
      @fileselected="onFileSelected"
      accept=".png,.jpg,.jpeg"
    />

    <div class="preview" v-if="previewUrl">
      <p class="preview-label">{{ $t('profile.avatar.preview') }}</p>
      <div
        ref="frameRef"
        class="preview-circle"
        :class="{ dragging: isDragging }"
        @mousedown="onPointerDown"
        @touchstart.passive="onPointerDown"
      >
        <img
          ref="imageRef"
          class="preview-image"
          :src="previewUrl"
          alt=""
          draggable="false"
          :style="imageStyle"
          @load="onImageLoad"
        />
      </div>

      <div class="zoom-row">
        <span class="zoom-icon">−</span>
        <input
          class="zoom-slider"
          type="range"
          :min="minScale"
          :max="maxScale"
          step="0.001"
          v-model.number="scale"
        />
        <span class="zoom-icon">+</span>
      </div>

      <p class="preview-hint">{{ $t('profile.avatar.preview_hint') }}</p>
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
import { computed, onBeforeUnmount, ref, toRef, watch } from 'vue'

import { useModal } from '@/composables/modal'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
// eslint-disable-next-line no-unused-vars
import FileUpload from '@/components/widgets/FileUpload.vue'

// Output dimensions of the cropped avatar in pixels. The display frame is
// driven by `.preview-circle` CSS (140px), but the canvas exports at a
// higher resolution so the avatar still looks sharp on retina.
const FRAME_SIZE = 140
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

const frameRef = ref(null)
const imageRef = ref(null)
const uploadAvatarField = ref(null)
const originalFile = ref(null)
const formData = ref(null)
const previewUrl = ref(null)
const naturalSize = ref({ width: 0, height: 0 })
const scale = ref(1)
const offset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ pointerX: 0, pointerY: 0, offsetX: 0, offsetY: 0 })

// Computed

// Minimum scale so the scaled image still covers the circular frame.
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
  uploadAvatarField.value?.reset()
}

const onFileSelected = data => {
  releasePreview()
  originalFile.value = data?.get('file') || null
  formData.value = data
  if (originalFile.value) {
    previewUrl.value = URL.createObjectURL(originalFile.value)
  }
  emit('fileselected', data)
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
  // Keep the point at the centre of the frame anchored while zooming so the
  // user's framing stays predictable rather than jumping around.
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
  margin-bottom: 1rem;
}

.error {
  color: $red;
  margin-top: 1rem;
}

.preview {
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-top: 1.5rem;
}

.preview-label {
  color: var(--text-alt);
  font-size: 0.85rem;
  letter-spacing: 1px;
  margin: 0 0 0.75rem;
  text-transform: uppercase;
}

.preview-circle {
  background: var(--background-page);
  border: 1px solid var(--border);
  border-radius: 50%;
  cursor: grab;
  height: 140px;
  overflow: hidden;
  position: relative;
  touch-action: none;
  user-select: none;
  width: 140px;

  &.dragging {
    cursor: grabbing;
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

.zoom-row {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  width: 200px;
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

.preview-hint {
  color: var(--text-alt);
  font-size: 0.85rem;
  margin: 0.75rem 0 0;
  text-align: center;
}
</style>
