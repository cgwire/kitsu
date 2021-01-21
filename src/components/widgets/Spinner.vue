<template>
<div
  class="has-text-centered"
  :style="sizeStyle"
>
  <img src="../../assets/spinner-white.svg" v-if="isWhite" />
  <square-grid :style="{ margin: 'auto'}" v-else-if="isProcessing"/>
  <origami :style="{ margin: 'auto'}" v-else-if="isStylish" />
  <img src="../../assets/spinner.svg" v-else>
</div>
</template>

<script>
import {
  SquareGrid,
  Origami
} from 'vue-loading-spinner'

export default {
  name: 'spinner',
  components: {
    SquareGrid,
    Origami
  },

  props: {
    isWhite: {
      type: Boolean,
      default: false
    },
    isProcessing: {
      type: Boolean,
      default: false
    },
    isStylish: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number
    }
  },

  computed: {
    sizeStyle: function () {
      return {
        width: this.size ? this.size + 'px' : 'auto'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
