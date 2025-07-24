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
      ref="model-viewer"
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

<script>
export default {
  name: 'object-viewer',

  props: {
    previewUrl: {
      default: null,
      type: String
    },
    light: {
      default: false,
      type: Boolean
    },
    readOnly: {
      default: false,
      type: Boolean
    },
    defaultHeight: {
      default: 0,
      type: Number
    },
    backgroundUrl: {
      type: String
    },
    isEnvironmentSkybox: {
      default: false,
      type: Boolean
    },
    isWireframe: {
      default: false,
      type: Boolean
    }
  },

  emits: ['model-loaded'],

  data() {
    return {
      panningHDR: false,
      changingFocale: false,
      fieldOfView: 50,
      lastX: 0,
      lastY: 0,
      lockOrbit: null,
      lockCameraTarget: null,
      skyboxAngle: 0,
      radiansPerPixel: 0,
      overlayText: null
    }
  },

  async mounted() {
    if (!customElements.get('model-viewer')) {
      // lazy load model-viewer
      await import('@google/model-viewer')
    }
    this.addEventListeners()
  },

  beforeUnmount() {
    this.removeEventListeners()
  },

  methods: {
    /**
     * Create a wireframe variant of each material of a 3D model
     * @param {Model} model - model from model-viewer component
     */
    createWireframeVariant(model) {
      const maxIndex = model.materials.length
      for (let i = 0; i < maxIndex; i++) {
        const variantMaterial = model.createMaterialInstanceForVariant(
          i,
          `material-wireframe-${i}`,
          'variant-wireframe',
          this.isWireframe
        )
        if (!variantMaterial) {
          continue
        }
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
    },

    getAnimations() {
      return this.$refs['model-viewer'].availableAnimations
    },

    play(animationName) {
      this.$refs['model-viewer'].animationName = animationName
      this.$refs['model-viewer'].play()
    },

    pause() {
      this.$refs['model-viewer'].pause()
    },

    // Skybox rotation methods
    startPanHDR(thisX) {
      const modelViewer = this.$refs['model-viewer']
      if (!modelViewer) return

      const orbit = modelViewer.getCameraOrbit()
      const { radius } = orbit
      this.panningHDR = true
      this.lastX = thisX
      this.lockCameraTarget = modelViewer.getCameraTarget()

      // Calculate radians per pixel based on the model viewer's width
      this.radiansPerPixel =
        (-1 * radius) / modelViewer.getBoundingClientRect().width
    },

    updatePanHDR(thisX) {
      // To rotate the skybox, we rotate the camera and adjust the turntabke
      // rotation to make the illusion of rotating the skybox
      const modelViewer = this.$refs['model-viewer']
      if (!modelViewer) return

      const delta = (thisX - this.lastX) * this.radiansPerPixel * 2
      if (delta === 0) {
        return
      }
      this.lastX = thisX
      this.skyboxAngle += delta
      const orbit = modelViewer.getCameraOrbit()
      orbit.theta += delta
      modelViewer.cameraOrbit = orbit.toString()
      modelViewer.cameraTarget = this.lockCameraTarget
      modelViewer.resetTurntableRotation(this.skyboxAngle)
      modelViewer.jumpCameraToGoal()
      this.overlayText = `Rotate Skybox: ${this.skyboxAngle.toFixed(2)} rad`
    },

    endPanHDR() {
      this.panningHDR = false
      this.lastX = 0
      this.radiansPerPixel = 0
      this.overlayText = null
    },

    startChangingFocale(thisY) {
      const modelViewer = this.$refs['model-viewer']

      if (!modelViewer) return
      const orbit = modelViewer.getCameraOrbit()
      this.changingFocale = true
      this.lastY = thisY

      // Store orbit to lock it while changing focal length.
      this.lockOrbit = orbit
      const { radius } = orbit
      this.radiansPerPixel =
        (-1 * radius) / modelViewer.getBoundingClientRect().height
    },

    updateFocale(thisY) {
      const modelViewer = this.$refs['model-viewer']
      if (!modelViewer) return

      const delta = (thisY - this.lastY) * this.radiansPerPixel * 15
      this.lastY = thisY
      this.overlayText = `Fov: ${Math.floor(this.fieldOfView)} deg`
      this.fieldOfView += delta
      if (this.fieldOfView < 10) {
        this.fieldOfView = 10
      } else if (this.fieldOfView > 100) {
        this.fieldOfView = 100
      }
      modelViewer.fieldOfView = `${Math.floor(this.fieldOfView)}deg`
      // Reset the camera orbit to the locked one, because dragging will cause
      // the orbit to change and we want to keep the orbit locked while
      // changing focal length.
      modelViewer.cameraOrbit = this.lockOrbit
    },

    endChangingFocale() {
      this.changingFocale = false
      this.lastY = 0
      this.radiansPerPixel = 0
      this.overlayText = null
      this.lockOrbit = null
    },

    // Event handlers

    handleMouseDown(event) {
      if (event.button === 0 && event.altKey) {
        this.startChangingFocale(event.clientY)
      }
      if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
        this.startPanHDR(event.clientX)
      }
      event.preventDefault()
      event.stopPropagation()
    },

    handleTouchStart(event) {
      const { targetTouches, touches } = event

      // 2-finger horizontal pan for skybox rotation
      if (
        targetTouches.length === 2 &&
        targetTouches.length === touches.length
      ) {
        this.lastX = 0.5 * (targetTouches[0].clientX + targetTouches[1].clientX)
        this.startPanHDR(this.lastX)
        event.preventDefault()
        return
      }

      // 3-finger vertical gesture for focal length
      if (
        targetTouches.length === 3 &&
        targetTouches.length === touches.length
      ) {
        this.lastY =
          (targetTouches[0].clientY +
            targetTouches[1].clientY +
            targetTouches[2].clientY) /
          3
        this.startChangingFocale(this.lastY)
        event.preventDefault()
        return
      }
    },

    handleMouseMove(event) {
      if (this.panningHDR) {
        this.updatePanHDR(event.clientX)
        event.stopPropagation()
      }
      if (this.changingFocale) {
        this.updateFocale(event.clientY)
        event.stopPropagation()
        event.preventDefault()
      }
    },

    handleTouchMove(event) {
      const { targetTouches } = event

      // Handle 2 - finger skybox rotation
      if (this.panningHDR && targetTouches.length === 2) {
        const thisX =
          0.5 * (targetTouches[0].clientX + targetTouches[1].clientX)
        this.updatePanHDR(thisX)
        event.preventDefault()
        return
      }

      // Handle 3 - finger focal length change
      if (this.changingFocale && targetTouches.length === 3) {
        const thisY =
          (targetTouches[0].clientY +
            targetTouches[1].clientY +
            targetTouches[2].clientY) /
          3
        this.updateFocale(thisY)
        event.preventDefault()
        return
      }
    },

    handleMouseUp() {
      if (this.panningHDR) {
        this.endPanHDR()
      }
      if (this.changingFocale) {
        this.endChangingFocale()
      }
    },

    handleTouchEnd(event) {
      if (this.panningHDR) {
        this.endPanHDR()
      }
      if (this.changingFocale) {
        this.endChangingFocale()
      }
    },

    addEventListeners() {
      const modelViewerElement = this.$refs['model-viewer']
      if (modelViewerElement) {
        modelViewerElement.addEventListener(
          'mousedown',
          this.handleMouseDown,
          true
        )
        modelViewerElement.addEventListener(
          'touchstart',
          this.handleTouchStart,
          true
        )
        modelViewerElement.addEventListener(
          'touchmove',
          this.handleTouchMove,
          true
        )
        modelViewerElement.addEventListener(
          'touchend',
          this.handleTouchEnd,
          true
        )
      }
      window.addEventListener('mousemove', this.handleMouseMove, true)
      window.addEventListener('mouseup', this.handleMouseUp, true)
    },

    removeEventListeners() {
      const modelViewerElement = this.$refs['model-viewer']
      if (modelViewerElement) {
        modelViewerElement.removeEventListener(
          'mousedown',
          this.handleMouseDown,
          true
        )
        modelViewerElement.removeEventListener(
          'touchstart',
          this.handleTouchStart,
          true
        )
        modelViewerElement.removeEventListener(
          'touchmove',
          this.handleTouchMove,
          true
        )
        modelViewerElement.removeEventListener(
          'touchend',
          this.handleTouchEnd,
          true
        )
      }
      window.removeEventListener('mousemove', this.handleMouseMove, true)
      window.removeEventListener('mouseup', this.handleMouseUp, true)
    }
  }
}
</script>

<style lang="scss" scoped>
.model-viewer {
  height: 100%;
  width: 100%;
  background-color: #333;
  --progress-bar-color: #999;

  &.light {
    height: 200px;
  }
}
</style>
