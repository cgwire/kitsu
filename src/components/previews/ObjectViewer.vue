<template>
<div
  id="model-container"
  :style="{
    height: defaultHeight ? defaultHeight + 'px' : '100%',
    width: '100%'
  }"
  :class="{
    light: light && !readOnly
  }"
>
  <model-viewer
    id="model-viewer"
    loading="eager"
    camera-controls
    :src="previewUrl"
    autoplay
  >
  </model-viewer>
</div>
</template>

<script>
import {
} from 'vue-feather-icons'

import('@google/model-viewer')

export default {
  name: 'object-viewer',

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
      default: 0
    },
    fullScreen: {
      default: false,
      type: Boolean
    }
  },

  mounted () {
  },

  computed: {
    container () {
      return this.$refs.container
    }
  },

  methods: {
  },

  watch: {
    defaultHeight () {
    },

    previewUrl () {
    },

    light () {
    }
  }
}
</script>

<style lang="scss" scoped>
#model-viewer.light {
  height: 200px;
}

#model-viewer {
  height: 100%;
  width: 100%;
}
</style>
