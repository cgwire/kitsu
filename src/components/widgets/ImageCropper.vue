<template>
  <div class="image-cropper">
    <input
      ref="fileInputRef"
      class="hidden-input"
      type="file"
      accept=".png,.jpg,.jpeg"
      @change="onFileChange"
    />

    <div
      class="cropper-frame"
      :class="[
        `shape-${shape}`,
        {
          dragging: isDragging,
          'drag-over': isDragOver,
          empty: !previewUrl
        }
      ]"
      :style="{ width: `${size}px`, height: `${size}px` }"
      :tabindex="previewUrl ? -1 : 0"
      @mousedown="onPointerDown"
      @touchstart.passive="onPointerDown"
      @click="onFrameClick"
      @keydown.enter.prevent="openFilePicker"
      @keydown.space.prevent="openFilePicker"
      @dragenter.prevent="isDragOver = true"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="onDrop"
    >
      <img
        ref="imageRef"
        class="cropper-image"
        :src="previewUrl"
        alt=""
        draggable="false"
        :style="imageStyle"
        @load="onImageLoad"
        v-if="previewUrl"
      />
      <div class="cropper-placeholder" v-else>
        <upload-icon class="placeholder-icon" :size="32" :stroke-width="1.5" />
        <span class="placeholder-text">
          {{ $t('profile.avatar.drop_or_click') }}
        </span>
      </div>
    </div>

    <div class="cropper-controls" v-if="previewUrl">
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
      <p class="cropper-hint">{{ $t('profile.avatar.preview_hint') }}</p>
    </div>
  </div>
</template>

<script setup>
import { UploadIcon } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  shape: {
    type: String,
    default: 'circle',
    validator: value => ['circle', 'rounded'].includes(value)
  },
  size: { type: Number, default: 180 },
  outputSize: { type: Number, default: 400 },
  outputType: { type: String, default: 'image/jpeg' },
  outputQuality: { type: Number, default: 0.92 }
})

const emit = defineEmits(['fileselected'])

const fileInputRef = ref(null)
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

const minScale = computed(() => {
  const { width, height } = naturalSize.value
  if (!width || !height) return 1
  return Math.max(props.size / width, props.size / height)
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

const clampOffset = (x, y) => {
  const { width, height } = naturalSize.value
  const scaled = { w: width * scale.value, h: height * scale.value }
  const minX = props.size - scaled.w
  const minY = props.size - scaled.h
  return {
    x: Math.min(0, Math.max(minX, x)),
    y: Math.min(0, Math.max(minY, y))
  }
}

const centerOffset = () => {
  const { width, height } = naturalSize.value
  offset.value = {
    x: (props.size - width * scale.value) / 2,
    y: (props.size - height * scale.value) / 2
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

const onFrameClick = event => {
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

watch(scale, (value, previous) => {
  if (!naturalSize.value.width) return
  if (!previous || previous === value) {
    offset.value = clampOffset(offset.value.x, offset.value.y)
    return
  }
  const ratio = value / previous
  const centerX = props.size / 2
  const centerY = props.size / 2
  const newX = centerX - (centerX - offset.value.x) * ratio
  const newY = centerY - (centerY - offset.value.y) * ratio
  offset.value = clampOffset(newX, newY)
})

onBeforeUnmount(() => {
  releasePreview()
  onPointerUp()
})

// Public API — render the visible region of the frame onto an off-screen
// canvas at outputSize x outputSize and return a fresh FormData. Falls back
// to the original FormData when no image has been loaded.
const cropToFormData = () =>
  new Promise((resolve, reject) => {
    if (!imageRef.value || !naturalSize.value.width) {
      resolve(formData.value)
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = props.outputSize
    canvas.height = props.outputSize
    const ctx = canvas.getContext('2d')
    const sourceSize = props.size / scale.value
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
      props.outputSize,
      props.outputSize
    )
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Cropping failed'))
          return
        }
        const name = originalFile.value?.name || 'image.jpg'
        const file = new File([blob], name, { type: blob.type })
        const data = new FormData()
        data.append('file', file, file.name)
        resolve(data)
      },
      props.outputType,
      props.outputQuality
    )
  })

defineExpose({
  reset,
  cropToFormData,
  hasFile: computed(() => Boolean(formData.value))
})
</script>

<style lang="scss" scoped>
.image-cropper {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hidden-input {
  display: none;
}

.cropper-frame {
  background: var(--background-page);
  border: 1px solid var(--border);
  cursor: grab;
  outline: none;
  overflow: hidden;
  position: relative;
  touch-action: none;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
  user-select: none;

  &.shape-circle {
    border-radius: 50%;
  }

  &.shape-rounded {
    border-radius: 16px;
  }

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

.cropper-image {
  display: block;
  max-width: none;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}

.cropper-placeholder {
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

.cropper-controls {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 260px;
  width: 100%;
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

.cropper-hint {
  color: var(--text-alt);
  font-size: 0.8rem;
  margin: 0;
  text-align: center;
}
</style>
