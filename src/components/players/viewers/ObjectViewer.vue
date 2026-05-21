<template>
  <div
    class="model-container"
    :class="{
      light: light && !readOnly
    }"
    :style="{
      height: defaultHeight ? defaultHeight + 'px' : '100%',
      width: '100%',
      position: 'relative'
    }"
  >
    <model-viewer
      ref="modelViewer"
      class="model-viewer"
      :style="{
        position: 'absolute',
        top: '0',
        left: '0'
      }"
      camera-controls
      loading="eager"
      :environment-image="backgroundUrl"
      :skybox-image="isEnvironmentSkybox ? backgroundUrl : ''"
      :src="previewUrl"
      field-of-view="50deg"
      min-field-of-view="10deg"
      max-field-of-view="100deg"
      :variant-name="isWireframe ? 'variant-wireframe' : null"
      @before-render="createWireframeVariant($event.target.model)"
      @load="$emit('model-loaded')"
    />
    <div
      v-if="overlayText"
      :style="{
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        padding: '15px'
      }"
    >
      <span
        :style="{
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '5px',
          fontSize: '14px',
          textAlign: 'center',
          borderRadius: '5px'
        }"
      >
        {{ overlayText }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  backgroundUrl: {
    type: String,
    default: ''
  },
  defaultHeight: {
    type: Number,
    default: 0
  },
  isEnvironmentSkybox: {
    type: Boolean,
    default: false
  },
  isWireframe: {
    type: Boolean,
    default: false
  },
  light: {
    type: Boolean,
    default: false
  },
  previewUrl: {
    type: String,
    default: null
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

defineEmits(['model-loaded'])

const modelViewer = ref(null)
const panningHDR = ref(false)
const changingFocale = ref(false)
const fieldOfView = ref(50)
const overlayText = ref(null)

let lastX = 0
let lastY = 0
let lockOrbit = null
let lockCameraTarget = null
let skyboxAngle = 0
let radiansPerPixel = 0

const createWireframeVariant = model => {
  const maxIndex = model.materials.length
  for (let i = 0; i < maxIndex; i++) {
    const variantMaterial = model.createMaterialInstanceForVariant(
      i,
      `material-wireframe-${i}`,
      'variant-wireframe',
      props.isWireframe
    )
    if (!variantMaterial) continue
    const texture = variantMaterial.normalTexture
    const materialsSymbol = Object.getOwnPropertySymbols(texture).find(
      symbol => symbol.description === 'materials'
    )
    const materials = texture[materialsSymbol]
    materials.forEach(material => {
      material.wireframe = true
      material.color.setHex(0xc0c0c0)
      material.emissive?.setHex(0xc0c0c0)
      material.emissiveMap = null
      material.envMapIntensity = 0
    })
  }
}

const getAnimations = () => {
  return modelViewer.value.availableAnimations
}

const play = animationName => {
  modelViewer.value.animationName = animationName
  modelViewer.value.play()
}

const pause = () => {
  modelViewer.value.pause()
}

const startPanHDR = thisX => {
  const mv = modelViewer.value
  if (!mv) return
  const orbit = mv.getCameraOrbit()
  const { radius } = orbit
  panningHDR.value = true
  lastX = thisX
  lockCameraTarget = mv.getCameraTarget()
  radiansPerPixel = (-1 * radius) / mv.getBoundingClientRect().width
}

const updatePanHDR = thisX => {
  const mv = modelViewer.value
  if (!mv) return
  const delta = (thisX - lastX) * radiansPerPixel * 2
  if (delta === 0) return
  lastX = thisX
  skyboxAngle += delta
  const orbit = mv.getCameraOrbit()
  orbit.theta += delta
  mv.cameraOrbit = orbit.toString()
  mv.cameraTarget = lockCameraTarget
  mv.resetTurntableRotation(skyboxAngle)
  mv.jumpCameraToGoal()
  overlayText.value = `Rotate Skybox: ${skyboxAngle.toFixed(2)} rad`
}

const endPanHDR = () => {
  panningHDR.value = false
  lastX = 0
  radiansPerPixel = 0
  overlayText.value = null
}

const startChangingFocale = thisY => {
  const mv = modelViewer.value
  if (!mv) return
  const orbit = mv.getCameraOrbit()
  changingFocale.value = true
  lastY = thisY
  lockOrbit = orbit
  const { radius } = orbit
  radiansPerPixel = (-1 * radius) / mv.getBoundingClientRect().height
}

const updateFocale = thisY => {
  const mv = modelViewer.value
  if (!mv) return
  const delta = (thisY - lastY) * radiansPerPixel * 15
  lastY = thisY
  overlayText.value = `Fov: ${Math.floor(fieldOfView.value)} deg`
  fieldOfView.value += delta
  if (fieldOfView.value < 10) {
    fieldOfView.value = 10
  } else if (fieldOfView.value > 100) {
    fieldOfView.value = 100
  }
  mv.fieldOfView = `${Math.floor(fieldOfView.value)}deg`
  mv.cameraOrbit = lockOrbit
}

const endChangingFocale = () => {
  changingFocale.value = false
  lastY = 0
  radiansPerPixel = 0
  overlayText.value = null
  lockOrbit = null
}

const handleMouseDown = event => {
  if (event.button === 0 && event.altKey) {
    startChangingFocale(event.clientY)
  }
  if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
    startPanHDR(event.clientX)
  }
  event.preventDefault()
  event.stopPropagation()
}

const handleTouchStart = event => {
  const { targetTouches, touches } = event
  if (targetTouches.length === 2 && targetTouches.length === touches.length) {
    lastX = 0.5 * (targetTouches[0].clientX + targetTouches[1].clientX)
    startPanHDR(lastX)
    event.preventDefault()
    return
  }
  if (targetTouches.length === 3 && targetTouches.length === touches.length) {
    lastY =
      (targetTouches[0].clientY +
        targetTouches[1].clientY +
        targetTouches[2].clientY) /
      3
    startChangingFocale(lastY)
    event.preventDefault()
    return
  }
}

const handleMouseMove = event => {
  if (panningHDR.value) {
    updatePanHDR(event.clientX)
    event.stopPropagation()
  }
  if (changingFocale.value) {
    updateFocale(event.clientY)
    event.stopPropagation()
    event.preventDefault()
  }
}

const handleTouchMove = event => {
  const { targetTouches } = event
  if (panningHDR.value && targetTouches.length === 2) {
    const thisX = 0.5 * (targetTouches[0].clientX + targetTouches[1].clientX)
    updatePanHDR(thisX)
    event.preventDefault()
    return
  }
  if (changingFocale.value && targetTouches.length === 3) {
    const thisY =
      (targetTouches[0].clientY +
        targetTouches[1].clientY +
        targetTouches[2].clientY) /
      3
    updateFocale(thisY)
    event.preventDefault()
    return
  }
}

const handleMouseUp = () => {
  if (panningHDR.value) endPanHDR()
  if (changingFocale.value) endChangingFocale()
}

const handleTouchEnd = () => {
  if (panningHDR.value) endPanHDR()
  if (changingFocale.value) endChangingFocale()
}

const addEventListeners = () => {
  const el = modelViewer.value
  if (el) {
    el.addEventListener('mousedown', handleMouseDown, true)
    el.addEventListener('touchstart', handleTouchStart, true)
    el.addEventListener('touchmove', handleTouchMove, true)
    el.addEventListener('touchend', handleTouchEnd, true)
  }
  window.addEventListener('mousemove', handleMouseMove, true)
  window.addEventListener('mouseup', handleMouseUp, true)
}

const removeEventListeners = () => {
  const el = modelViewer.value
  if (el) {
    el.removeEventListener('mousedown', handleMouseDown, true)
    el.removeEventListener('touchstart', handleTouchStart, true)
    el.removeEventListener('touchmove', handleTouchMove, true)
    el.removeEventListener('touchend', handleTouchEnd, true)
  }
  window.removeEventListener('mousemove', handleMouseMove, true)
  window.removeEventListener('mouseup', handleMouseUp, true)
}

onMounted(async () => {
  if (!customElements.get('model-viewer')) {
    await import('@google/model-viewer')
  }
  addEventListeners()
})

onBeforeUnmount(() => {
  removeEventListeners()
})

defineExpose({ getAnimations, play, pause })
</script>

<style lang="scss" scoped>
.model-viewer {
  height: 100%;
  width: 100%;
  background-color: #333;
  --progress-bar-color: $grey;
}
</style>
