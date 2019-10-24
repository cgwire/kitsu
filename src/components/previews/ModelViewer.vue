<template>
<div ref="container">
  <div
    ref="model-viewer"
    id="model-viewer"
    :class="{
      light: light && !readOnly
    }"
  >
  </div>
  <div class="viewer-actions flexrow">
    <span v-if="isLoading">{{ $t('main.loading') }}</span>
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

  data () {
    return {
      isLoading: false
    }
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
    },

    container () {
      return this.$refs['container']
    }
  },

  methods: {
    goFullScreen () {
      goFullScreen(this.element)
    },

    loadObject () {
      console.log('start')
      this.isLoading = true
      loadObject(this.scene, this.previewUrl, null, () => {
        this.isLoading = false
      })
    }
  },

  mounted () {
    setTimeout(() => {
      this.scene = prepareScene(this.element)
      this.loadObject()
    }, 100)
  },

  watch: {
    previewUrl () {
      clearScene(this.scene)
      this.loadObject()
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
