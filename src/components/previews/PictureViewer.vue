<template>
  <div ref="container" class="picture-player">
    <div
      ref="pictureWrapper"
      class="picture-wrapper"
      oncontextmenu="return false"
    >
      <div
        v-show="!isLoading"
        class="picture-subwrapper"
        ref="pictureSubWrapper"
      >
        <div
          ref="loupe"
          class="loupe"
          id="loupe"
          :style="{
            background: 'url(' + pictureDlPath + ')'
          }"
        ></div>
        <div v-show="isGif">
          <img ref="pictureGif" :src="pictureGifPath" />
        </div>
        <div v-show="!isGif">
          <img
            ref="pictureBig"
            :src="pictureDlPath"
            v-show="fullScreen || big"
          />
          <img ref="picture" :src="picturePath" v-show="!fullScreen && !big" />
        </div>
      </div>
      <spinner v-if="isLoading" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import createPanzoom from 'panzoom'

import Spinner from '@/components/widgets/Spinner.vue'

const props = defineProps({
  big: {
    type: Boolean,
    default: false
  },
  defaultHeight: {
    type: Number,
    default: 0
  },
  marginBottom: {
    type: Number,
    default: 0
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  highQuality: {
    type: Boolean,
    default: false
  },
  isComparing: {
    type: Boolean,
    default: false
  },
  light: {
    type: Boolean,
    default: false
  },
  preview: {
    type: Object,
    default: () => ({})
  },
  panzoom: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['loaded', 'panzoom-changed', 'size-changed'])

const container = ref(null)
const pictureWrapper = ref(null)
const pictureSubWrapper = ref(null)
const loupe = ref(null)
const picture = ref(null)
const pictureBig = ref(null)
const pictureGif = ref(null)

const isLoading = ref(true)
const picturePath = ref('')
const pictureDlPath = ref('')
const pictureGifPath = ref('')
const panzoomInstances = ref([])

let panzoomBig = null
let panzoomGifInstance = null
let previousDimensions = null
let lastPreviewId = null
let silent = false

const status = computed(() =>
  props.preview && props.preview.status ? props.preview.status : 'ready'
)

const isAvailable = computed(
  () => !['broken', 'processing'].includes(status.value)
)

const extension = computed(() => (props.preview ? props.preview.extension : ''))

const isGif = computed(() => extension.value === 'gif')

const isPicture = computed(() =>
  ['gif', 'png', 'jpg', 'jpeg'].includes(extension.value)
)

const visibleImage = computed(() => {
  if (isGif.value) return pictureGif.value
  if (props.fullScreen || props.big) return pictureBig.value
  return picture.value
})

const getNaturalDimensions = () => {
  let pic = { naturalWidth: 0, naturalHeight: 0 }
  if (!props.fullScreen && picture.value.naturalWidth && !isGif.value) {
    pic = picture.value
  } else if (
    props.fullScreen &&
    pictureBig.value.naturalWidth &&
    !isGif.value
  ) {
    pic = pictureBig.value
  } else if (pictureGif.value.naturalWidth && isGif.value) {
    pic = pictureGif.value
  }
  return { height: pic.naturalHeight, width: pic.naturalWidth }
}

const getDimensions = () => {
  let ratio = 1
  const dimensions = getNaturalDimensions()
  if (dimensions.width > 0) ratio = dimensions.height / dimensions.width
  let width = dimensions.width
  if (width > container.value.offsetWidth && container.value.offsetWidth > 0) {
    width = container.value.offsetWidth
  }
  let height = Math.floor(width * ratio)
  if (height > props.defaultHeight) {
    height = props.defaultHeight
  }
  width = Math.floor(height / ratio)
  return { width, height }
}

const resetPicture = () => {
  const heightValue = props.defaultHeight + 'px'
  container.value.style.height = heightValue
  if (pictureWrapper.value) pictureWrapper.value.style.height = heightValue
  if (pictureSubWrapper.value) {
    pictureWrapper.value.style['max-height'] = heightValue
    pictureSubWrapper.value.style['max-height'] = heightValue
    pictureSubWrapper.value.style['height'] = heightValue
  }
  let { width, height } = getDimensions()
  picture.value.style.width = width + 'px'
  picture.value.style.height = height + 'px'
  pictureBig.value.style.width = width + 'px'
  pictureBig.value.style.height = height + 'px'
  pictureGif.value.style.width = width + 'px'
  pictureGif.value.style.height = height + 'px'
  picture.value.width = width
  picture.value.height = height
  pictureBig.value.width = width
  pictureBig.value.height = height
  pictureGif.value.width = width
  pictureGif.value.height = height

  if (props.fullScreen) {
    pictureBig.value.style.maxHeight = `calc(100vh - ${props.marginBottom}px)`
  }

  if (isPicture.value) {
    const pictureElement = isGif.value
      ? pictureGif.value
      : props.fullScreen
        ? pictureBig.value
        : picture.value
    const picturePosition = pictureElement.getBoundingClientRect()
    const containerPosition = container.value.getBoundingClientRect()
    const top = picturePosition.top - containerPosition.top
    const left = picturePosition.left - containerPosition.left
    width = picturePosition.width
    height = picturePosition.height

    resetPanZoom()

    if (
      !previousDimensions ||
      previousDimensions.width !== width ||
      previousDimensions.height !== height ||
      previousDimensions.left !== left ||
      previousDimensions.top !== top
    ) {
      emit('size-changed', { width, height, top, left })
    }
    previousDimensions = { width, height, top, left }
  }
}

const setPictureEmptyPath = () => {
  if (isGif.value && isPicture.value) {
    pictureGifPath.value = null
  } else if (props.preview && isPicture.value) {
    picturePath.value = null
    pictureDlPath.value = null
  }
}

const setPictureDlPath = () => {
  if (props.preview && isAvailable.value && isPicture.value) {
    const previewId = props.preview.id
    pictureDlPath.value = `/api/pictures/originals/preview-files/${previewId}/download`
  } else {
    pictureDlPath.value = null
  }
}

const setPicturePath = () => {
  if (isGif.value && isAvailable.value && isPicture.value) {
    const previewId = props.preview.id
    pictureGifPath.value = `/api/pictures/originals/preview-files/${previewId}.gif`
  } else if (props.preview && isAvailable.value && isPicture.value) {
    const previewId = props.preview.id
    if (props.highQuality) {
      picturePath.value = `/api/pictures/originals/preview-files/${previewId}.png`
    } else {
      picturePath.value = `/api/pictures/previews/preview-files/${previewId}.png`
    }
  }
  setPictureDlPath()
}

const endLoading = () => {
  if (
    props.fullScreen &&
    (pictureBig.value.complete || pictureGif.value.complete)
  ) {
    isLoading.value = false
  } else if (!props.fullScreen && picture.value.complete) {
    isLoading.value = false
  }
  emit('loaded')
  nextTick(resetPicture)
}

const showLoupe = () => {
  loupe.value.style.display = 'block'
}

const hideLoupe = () => {
  loupe.value.style.display = 'none'
}

const updateLoupePosition = (event, canvasDimensions) => {
  const w = canvasDimensions.width
  const h = canvasDimensions.height
  const maxWidth = parseInt(w.substring(0, w.length - 2))
  const maxHeight = parseInt(h.substring(0, h.length - 2))
  let x = Math.max(event.pointer.x - 150, 0)
  let y = Math.max(event.pointer.y - 150, 0)
  x = Math.min(x, maxWidth - 300)
  y = Math.min(y, maxHeight - 300)
  loupe.value.style.left = x + 'px'
  loupe.value.style.top = y + 'px'

  let zx = Math.max(event.pointer.x, 0)
  let zy = Math.max(event.pointer.y, 0)
  zx = Math.min(zx, maxWidth)
  zy = Math.min(zy, maxHeight)
  const naturalDimensions = getNaturalDimensions()
  const ratioW = naturalDimensions.width / maxWidth
  const bgX = Math.min(ratioW * zx - 150, naturalDimensions.width - 300)
  const bgY = Math.min(ratioW * zy - 150, naturalDimensions.height - 300)
  loupe.value.style['background-position'] = `-${bgX}px -${bgY}px`
}

const emitPanZoom = pz => {
  if (silent) return
  const { x, y, scale } = pz.getTransform()
  emit('panzoom-changed', { x, y, scale })
}

const setupPanZoom = () => {
  const pictures = [picture.value, pictureBig.value, pictureGif.value]
  panzoomInstances.value = pictures.map(pic =>
    createPanzoom(pic, {
      bounds: true,
      boundsPadding: 0.2,
      maxZoom: 5,
      minZoom: 1
    })
  )
  const panzoomSmall = panzoomInstances.value[0]
  panzoomBig = panzoomInstances.value[1]
  panzoomGifInstance = panzoomInstances.value[2]
  panzoomSmall.on('zoom', () => {
    if (props.big || props.fullScreen || isGif.value) return
    emitPanZoom(panzoomSmall)
  })
  panzoomSmall.on('pan', () => {
    if (props.big || props.fullScreen || isGif.value) return
    emitPanZoom(panzoomSmall)
  })
  panzoomBig.on('zoom', () => {
    if (!props.big) return
    emitPanZoom(panzoomBig)
  })
  panzoomBig.on('pan', () => {
    if (!props.big) return
    emitPanZoom(panzoomBig)
  })
  panzoomGifInstance.on('zoom', () => {
    if (!isGif.value) return
    emitPanZoom(panzoomGifInstance)
  })
  panzoomGifInstance.on('pan', () => {
    if (!isGif.value) return
    emitPanZoom(panzoomGifInstance)
  })
  pausePanZoom()
}

const resetPanZoom = () => {
  setPanZoom(0, 0, 1)
}

const pausePanZoom = () => {
  panzoomInstances.value.forEach(pz => pz.pause())
}

const resumePanZoom = () => {
  panzoomInstances.value.forEach(pz => pz.resume())
}

const setPanZoom = (x, y, scale) => {
  silent = true
  if (panzoomInstances.value.length === 0) return
  let pz = panzoomInstances.value[1]
  if (isGif.value) {
    pz = panzoomInstances.value[2]
  } else if (!props.big && !props.fullScreen) {
    pz = panzoomInstances.value[0]
  }
  const actualScale = pz.getTransform().scale
  const zoomFactor = scale / actualScale
  pz.moveTo(x, y)
  pz.setTransformOrigin({ x, y })
  pz.zoomTo(x, y, zoomFactor)
  pz.setTransformOrigin({ x: 0, y: 0 })
  nextTick(() => {
    silent = false
  })
}

onMounted(() => {
  container.value.style.height = props.defaultHeight + 'px'
  isLoading.value = true
  setPictureEmptyPath()
  if (picture.value.complete) {
    resetPicture()
  }
  picture.value.addEventListener('load', endLoading)
  pictureBig.value.addEventListener('load', endLoading)
  pictureGif.value.addEventListener('load', endLoading)
  window.addEventListener('resize', resetPicture)
  setPicturePath()
  setupPanZoom()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resetPicture)
  panzoomInstances.value.forEach(pz => pz.dispose())
})

watch(
  () => props.fullScreen,
  () => {
    resetPanZoom()
    if (props.fullScreen) {
      isLoading.value = true
      setPictureDlPath()
      if (pictureBig.value.complete) isLoading.value = false
    } else {
      setPicturePath()
    }
  }
)

watch(isLoading, () => {
  if (!isLoading.value) {
    setTimeout(resetPicture, 100)
  }
})

watch(
  () => props.light,
  () => {
    resetPanZoom()
    resetPicture()
  }
)

watch(
  () => props.isComparing,
  () => {
    resetPanZoom()
    setTimeout(() => {
      resetPicture()
    }, 20)
  }
)

watch(
  () => props.preview,
  () => {
    if (props.preview && props.preview.id !== lastPreviewId) {
      lastPreviewId = props.preview.id
      resetPanZoom()
      isLoading.value = true
      setPictureEmptyPath()
      nextTick(() => {
        resetPicture()
        setPicturePath()
        if (props.fullScreen) {
          if (pictureBig.value.complete) {
            resetPicture()
          }
        } else {
          nextTick(resetPicture)
        }
      })
    }
  }
)

defineExpose({
  getNaturalDimensions,
  getDimensions,
  resetPicture,
  showLoupe,
  hideLoupe,
  updateLoupePosition,
  resetPanZoom,
  pausePanZoom,
  resumePanZoom,
  setPanZoom,
  visibleImage
})
</script>

<style lang="scss" scoped>
.picture-player {
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  border-radius: 5px;
  height: 100%;
  width: 100%;
  text-align: center;
  background: $dark-grey-2;
}

.spinner {
  margin-top: 1em;
  margin-bottom: 1em;
}

.picture-wrapper {
  flex: 1;
  border-radius: 5px;
  display: flex;
  background: black;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  z-index: 300;
  margin: auto;
  overflow: hidden;
}

.picture-subwrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.loupe {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  height: 300px;
  width: 300px;
  background: white;
  z-index: 3000;
  border-radius: 5px;
  box-shadow: 0 0 8px 4px rgba(0, 0, 0, 0.2);

  img {
    position: relative;
    width: 800px;
  }
}
</style>
