<template>
<div>
  <div ref="model-viewer" id="model-viewer">
  </div>
  <div class="viewer-actions">
    <button
      class="button"
      @click="goFullScreen">
      <maximize-2-icon class="icon"></maximize-2-icon>
      <span class="text">
        {{ $t('tasks.full_screen') }}
      </span>
    </button>
  </div>
</div>
</template>

<script>
import {
  Maximize2Icon
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
    Maximize2Icon
  },

  props: {
    previewUrl: {
      default: '',
      type: String
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
    }
  }
}
</script>

<style scoped>
#model-viewer {
  height: 500px;
}

.viewer-actions {
  padding-top: 1em;
  text-align: left;
}
</style>
