<template>
  <div ref="container" class="multi-picture-player">
    <picture-viewer
      :ref="'picture-' + preview.id + '-' + preview.position"
      v-for="preview in previews"
      v-show="
        preview.id === currentPreview.id &&
        preview.position === currentPreview.position
      "
      :key="preview.id"
      :big="big"
      :preview="preview"
      :full-screen="fullScreen"
      :high-quality="highQuality"
      :is-comparing="isComparing"
      :light="light"
      :panzoom="panzoom"
      :default-height="defaultHeight"
      :margin-bottom="marginBottom"
      @loaded="() => $emit('loaded')"
      @panzoom-changed="$event => $emit('panzoom-changed', $event)"
      @size-changed="() => $emit('size-changed')"
    />
  </div>
</template>

<script>
import { fullScreenMixin } from '@/components/mixins/fullscreen'
import { domMixin } from '@/components/mixins/dom'

import PictureViewer from '@/components/previews/PictureViewer'

export default {
  name: 'multi-picture-viewer',

  mixins: [domMixin, fullScreenMixin],

  components: {
    PictureViewer
  },

  props: {
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
    panzoom: {
      type: Boolean,
      default: false
    },
    currentPreview: {
      type: Object,
      default: () => null
    },
    previews: {
      type: Array,
      default: () => []
    }
  },

  emits: ['loaded', 'panzoom-changed', 'size-changed'],

  data() {
    return {}
  },

  mounted() {
    this.container.style.height = this.defaultHeight + 'px'
  },

  beforeUnmount() {},

  computed: {
    container() {
      return this.$refs.container
    }
  },

  methods: {
    getNaturalDimensions() {
      if (!this.currentPreview) return { height: 0, width: 0 }
      const previewPlayer =
        this.$refs[
          'picture-' +
            this.currentPreview.id +
            '-' +
            this.currentPreview.position
        ]
      if (previewPlayer && previewPlayer[0]) {
        return previewPlayer[0].getNaturalDimensions()
      }
    },

    getDimensions() {
      if (!this.currentPreview) return { height: 0, width: 0 }
      const previewPlayer =
        this.$refs[
          'picture-' +
            this.currentPreview.id +
            '-' +
            this.currentPreview.position
        ]
      if (previewPlayer && previewPlayer[0]) {
        return previewPlayer[0].getDimensions()
      }
    },

    onWindowResize() {
      this.resetPicture()
    },

    // Configuration

    resetPicture() {
      this.container.style.height = this.defaultHeight + 'px'
      if (this.currentPreview) {
        const key =
          'picture-' +
          this.currentPreview.id +
          '-' +
          this.currentPreview.position
        const previewPlayer = this.$refs[key]
        if (previewPlayer && previewPlayer[0]) {
          previewPlayer[0].resetPicture()
        }
      }
    },

    resetPanZoom() {
      this.previews.forEach(preview => {
        const key = 'picture-' + preview.id + '-' + preview.position
        if (
          preview.id === this.currentPreview.id &&
          preview.position === this.currentPreview.position
        ) {
          const previewPlayer = this.$refs[key]
          if (previewPlayer && previewPlayer[0]) {
            previewPlayer[0].resetPanZoom()
          }
        }
      })
    },

    pausePanZoom() {
      this.previews.forEach(preview => {
        const key = 'picture-' + preview.id + '-' + preview.position
        const previewPlayer = this.$refs[key]
        if (previewPlayer && previewPlayer[0]) {
          previewPlayer[0].pausePanZoom()
        }
      })
    },

    resumePanZoom() {
      this.previews.forEach(preview => {
        const key = 'picture-' + preview.id + '-' + preview.position
        const previewPlayer = this.$refs[key]
        if (previewPlayer && previewPlayer[0]) {
          previewPlayer[0].resumePanZoom()
        }
      })
    },

    setPanZoom(x, y, scale) {
      this.previews.forEach(preview => {
        const key = 'picture-' + preview.id + '-' + preview.position
        const previewPlayer = this.$refs[key]
        if (
          preview.id === this.currentPreview.id &&
          preview.position === this.currentPreview.position
        ) {
          if (previewPlayer && previewPlayer[0]) {
            previewPlayer[0].setPanZoom(x, y, scale)
          }
        }
      })
    }
  },

  watch: {
    fullScreen() {
      this.resetPicture()
    },

    isComparing() {
      setTimeout(() => {
        this.resetPicture()
      }, 20)
    },

    currentPreview() {
      this.resetPicture()
    },

    previews() {
      this.resetPicture()
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-background {
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  background: black;
  align-items: center;
  justify-content: center;
}

.multi-picture-player {
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  border-radius: 5px;
  height: 100%;
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
}

.multi-picture-player {
  width: 100%;
  text-align: center;
  background: #36393f;
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
