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

import { isPicturePreview } from '@/lib/preview'

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
  marginBottom: {
    type: Number,
    default: 0
  },
  panzoom: {
    type: Boolean,
    default: false
  },
  preview: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['loaded', 'panzoom-changed', 'size-changed'])

const container = ref(null)
const isLoading = ref(true)
const picture = ref(null)
const pictureBig = ref(null)
const pictureDlPath = ref('')
const pictureGif = ref(null)
const pictureGifPath = ref('')
const picturePath = ref('')
const pictureSubWrapper = ref(null)
const pictureWrapper = ref(null)

let panzoomInstance = null
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

const isPicture = computed(() => isPicturePreview(extension.value))

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
  // resetPicture runs asynchronously (nextTick from endLoading, watcher
  // callbacks, ResizeObserver, …) so the component may have been torn
  // down by a parent v-for in the meantime — bail out cleanly instead
  // of crashing on the now-null template refs.
  if (!container.value) return
  const heightValue = props.defaultHeight + 'px'
  container.value.style.height = heightValue
  if (pictureWrapper.value) pictureWrapper.value.style.height = heightValue
  if (pictureSubWrapper.value) {
    pictureWrapper.value.style['max-height'] = heightValue
    pictureSubWrapper.value.style['max-height'] = heightValue
    pictureSubWrapper.value.style['height'] = heightValue
  }
  let { width, height } = getDimensions()
  ;[picture.value, pictureBig.value, pictureGif.value].forEach(img => {
    if (!img) return
    img.style.width = width + 'px'
    img.style.height = height + 'px'
    img.width = width
    img.height = height
  })

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

    // resetPanZoom is intentionally NOT called here: resetPicture
    // runs on every load / resize / mode toggle, and zeroing the
    // panzoom transform on each tick would erase any user zoom right
    // as panzoom's rAF tries to apply it. Preview-swap watchers
    // (below) still reset explicitly.

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
  // Refs can be null while the component is being torn down / rebuilt
  // by a parent v-for (previews change). The optional chain keeps the
  // listener safe in that window instead of throwing and aborting the
  // post-mount setup (which is what was leaving panzoom paused).
  if (
    props.fullScreen &&
    (pictureBig.value?.complete || pictureGif.value?.complete)
  ) {
    isLoading.value = false
  } else if (!props.fullScreen && picture.value?.complete) {
    isLoading.value = false
  }
  emit('loaded')
  nextTick(() => {
    resetPicture()
    // Bind (or rebind) panzoom only once the visible image has actual
    // pixel dimensions. Wiring it on an unsized img leaves panzoom's
    // bounds clamp computing against a 0×0 bbox, so the next pan / zoom
    // / cross-viewer sync ends up off-centre — which is what users on
    // slow connections were observing.
    if (visibleImage.value?.complete) setupPanZoom()
  })
}

const emitPanZoom = pz => {
  if (silent) return
  const { x, y, scale } = pz.getTransform()
  emit('panzoom-changed', { x, y, scale, source: 'picture' })
}

// Bind a single panzoom to whichever img is currently visible.
// The three <img> tags (picture / pictureBig / pictureGif) share the
// same parent, and panzoom attaches its wheel listener on
// `domElement.parentElement`. Creating one panzoom per img would
// stack three listeners on the same div, all responding to every
// wheel event and racing on the shared focal-point math. The hidden
// images (bbox 0×0) bypass bounds, win the race, and the visible
// one's transform never lands.
const setupPanZoom = () => {
  if (panzoomInstance) {
    panzoomInstance.dispose()
    panzoomInstance = null
  }
  const target = visibleImage.value
  if (!target) return
  panzoomInstance = createPanzoom(target, {
    bounds: true,
    boundsPadding: 0.2,
    maxZoom: 5,
    minZoom: 1,
    smoothScroll: false
  })
  panzoomInstance.on('zoom', () => emitPanZoom(panzoomInstance))
  panzoomInstance.on('pan', () => emitPanZoom(panzoomInstance))
  // Panzoom is live by default. Consumers that want it paused
  // (e.g. SharedPlaylistPlayer's "enable zoom" toggle) call
  // pausePanZoom() through the exposed method.
}

const resetPanZoom = () => {
  setPanZoom(0, 0, 1)
}

const pausePanZoom = () => {
  panzoomInstance?.pause()
}

const resumePanZoom = () => {
  panzoomInstance?.resume()
}

const setPanZoom = (x, y, scale) => {
  if (!panzoomInstance) return
  silent = true
  const actualScale = panzoomInstance.getTransform().scale
  const zoomFactor = scale / actualScale
  panzoomInstance.moveTo(x, y)
  panzoomInstance.setTransformOrigin({ x, y })
  panzoomInstance.zoomTo(x, y, zoomFactor)
  // Passing null clears the override so subsequent wheel zooms use the
  // cursor as focal point. Passing {x:0,y:0} would lock zoom at the
  // top-left corner.
  panzoomInstance.setTransformOrigin(null)
  nextTick(() => {
    silent = false
  })
}

// Direct accessor so consumers can read the visible <img> without
// going through Vue's exposed-ref auto-unwrap, which has been
// returning the wrong element in MultiPictureViewer's nested setup.
const getPictureElement = () => {
  if (isGif.value) return pictureGif.value
  if (props.fullScreen || props.big) return pictureBig.value
  return picture.value
}

// Watchers

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

// Re-bind panzoom whenever the visible image changes (mode toggle,
// preview swap, gif/png switch). Otherwise the single instance would
// stay bound to the previous img and lose sync with the displayed
// one.
watch(visibleImage, () => {
  // Wait for the new visible image to be loaded before binding panzoom;
  // endLoading will rebind once its load event fires. Binding now would
  // recreate the instance against an unsized target and leave the
  // picture off-centre on slow loads.
  if (visibleImage.value?.complete) setupPanZoom()
})

// Lifecycle

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
  // Cached-image case: load may have fired before the listener was
  // attached. For uncached images the bind happens later in endLoading.
  if (visibleImage.value?.complete) setupPanZoom()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resetPicture)
  panzoomInstance?.dispose()
  panzoomInstance = null
})

defineExpose({
  getDimensions,
  getNaturalDimensions,
  getPictureElement,
  pausePanZoom,
  resetPanZoom,
  resetPicture,
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

  // The imgs panzoom is attached to default to display: inline, which
  // adds a baseline descent gap below them inside their wrapper. The
  // wrapper's bounding rect then doesn't match the img content rect,
  // so panzoom's cursor-relative zoom math drifts.
  img {
    display: block;
  }
}
</style>
