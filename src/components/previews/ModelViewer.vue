<template>
<div
  id="model-container"
  :style="{
    height: defaultHeight + 'px',
    width: '100%'
  }"
  :class="{
    light: light && !readOnly
  }"
>
  <div
    id="model-viewer"
  >
  </div>
</div>
</template>

<script>
import {
} from 'vue-feather-icons'
import {
  clearScene,
  loadObject,
  prepareScene
} from '../../../node_modules/js-3d-model-viewer/src/index'

export default {
  name: 'model-viewer',

  components: {
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
    },
    empty: {
      default: false,
      type: Boolean
    },
    defaultHeight: {
      type: Number,
      default: 470
    },
    fullScreen: {
      default: false,
      type: Boolean
    }
  },

  mounted () {
    this.element = document.getElementById('model-viewer')
    setTimeout(() => {
      if (!this.empty) {
        this.loadObject()
      }
    }, 100)
  },

  computed: {
    container () {
      return this.$refs.container
    }
  },

  methods: {
    loadObject () {
      this.element.remove()
      const container = document.getElementById('model-container')
      const el = document.createElement('div')
      el.id = 'model-viewer'
      container.appendChild(el)
      this.element = document.getElementById('model-viewer')
      if (!this.scene) this.scene = prepareScene(this.element)
      this.isLoading = true
      loadObject(this.scene, this.previewUrl, null, () => {
        this.isLoading = false
      })
    }
  },

  watch: {
    defaultHeight () {
      clearScene(this.scene)
      setTimeout(() => {
        this.loadObject()
      }, 1000)
    },

    previewUrl () {
      if (!this.empty) {
        if (this.scene) clearScene(this.scene)
        this.loadObject()
      }
    },

    light () {
      clearScene(this.scene)
      this.element.innerHTML = ''
      setTimeout(() => {
        if (!this.empty) {
          loadObject(this.scene, this.previewUrl)
        }
      }, 100)
    }
  }
}
</script>

<style lang="scss" scoped>
#model-viewer.light {
  height: 200px;
}
</style>
