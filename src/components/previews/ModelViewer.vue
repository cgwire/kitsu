<template>
<div>
  <div
    ref="model-viewer"
    id="model-viewer"
    :class="{
      light: light && !readOnly
    }"
  >
  </div>
  <div class="viewer-actions flexrow">
    <span class="filler"></span>
    <a
      :href="previewDlPath"
      class="button flexrow-item"
      v-if="!readOnly"
    >
      <download-icon class="icon" />
    </a>
    <button
      class="button flexrow-item"
      @click="goFullScreen">
      <maximize-icon class="icon" />
    </button>
  </div>
</div>
</template>

<script>
import {
  DownloadIcon,
  MaximizeIcon
} from 'vue-feather-icons'
import {
  clearScene,
  goFullScreen,
  loadObject,
  prepareScene
} from '../../../node_modules/js-3d-model-viewer/src/index'

export default {
  name: 'model-viewer',

  components: {
    DownloadIcon,
    MaximizeIcon
  },

  props: {
    previewUrl: {
      default: '',
      type: String
    },
    previewDlPath: {
      default: '',
      type: String
    },
    light: {
      default: false,
      type: Boolean
    },
    readOnly: {
      default: false,
      type: Boolean
    }
  },

  computed: {
    element () {
      return this.$refs['model-viewer']
    }
  },

  methods: {
    goFullScreen () {
      goFullScreen(this.element)
    }
  },

  mounted () {
    setTimeout(() => {
      this.scene = prepareScene(this.element)
      loadObject(this.scene, this.previewUrl)
    }, 100)
  },

  watch: {
    previewUrl () {
      clearScene(this.scene)
      loadObject(this.scene, this.previewUrl)
    },

    light () {
      clearScene(this.scene)
      this.element.innerHTML = ''
      setTimeout(() => {
        this.scene = prepareScene(this.element)
        loadObject(this.scene, this.previewUrl)
      }, 100)
    }
  }
}
</script>

<style lang="scss" scoped>
#model-viewer {
  height: 500px;
}

#model-viewer.light {
  height: 200px;
}

.viewer-actions {
  padding: 0.2em 0;
  text-align: left;
}
</style>
