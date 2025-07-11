<template>
  <div
    class="model-container"
    :class="{
      light: light && !readOnly
    }"
    :style="{
      height: defaultHeight ? defaultHeight + 'px' : '100%',
      width: '100%'
    }"
  >
    <model-viewer
      ref="model-viewer"
      class="model-viewer"
      camera-controls
      loading="eager"
      :environment-image="backgroundUrl"
      :skybox-image="isEnvironmentSkybox ? backgroundUrl : ''"
      :src="previewUrl"
      :variant-name="isWireframe ? 'variant-wireframe' : null"
      @before-render="createWireframeVariant($event.target.model)"
      @load="$emit('model-loaded')"
    />
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

  async mounted() {
    if (!customElements.get('model-viewer')) {
      // lazy load model-viewer
      await import('@google/model-viewer')
    }
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
