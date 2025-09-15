<template>
  <div class="shape-wrapper">
    <button
      type="button"
      :class="{
        'shape-picker': true,
        'shape-button': true
      }"
      :icon="shape"
      :title="shape"
      @click="togglePalette"
    >
      <rectangle-horizontal-icon class="icon" v-if="shape === 'rectangle'" />
      <circle-icon class="icon" v-else-if="shape === 'circle'" />
      <arrow-up-right-icon class="icon" v-else-if="shape === 'arrow'" />
    </button>
    <div
      v-show="isOpen"
      :class="{
        'shape-palette': true
      }"
    >
      <button class="shape-button" @click="onShapePicked('rectangle')">
        <rectangle-horizontal-icon class="icon" />
      </button>
      <button class="shape-button" @click="onShapePicked('circle')">
        <circle-icon class="icon" />
      </button>
      <button class="shape-button" @click="onShapePicked('arrow')">
        <arrow-up-right-icon class="icon" />
      </button>
    </div>
  </div>
</template>

<script>
import {
  RectangleHorizontalIcon,
  CircleIcon,
  ArrowUpRightIcon
} from 'lucide-vue-next'

export default {
  name: 'shape-picker',

  components: {
    RectangleHorizontalIcon,
    CircleIcon,
    ArrowUpRightIcon
  },

  props: {
    shape: {
      type: String,
      default: 'rectangle'
    },
    palette: {
      default: () => ['rectangle', 'circle'],
      type: Array
    }
  },

  emits: ['change'],

  data() {
    return {
      isOpen: false
    }
  },

  methods: {
    togglePalette() {
      this.isOpen = !this.isOpen
    },

    onShapePicked(shape) {
      this.$emit('change', shape)
      this.isOpen = false
    }
  }
}
</script>

<style lang="scss" scoped>
.shape-wrapper {
  position: relative;
  display: inline-flex;
}
.shape-picker {
  padding: 0;
  background-color: transparent;
  cursor: pointer;
  color: white;
}
.preview .shape-picker {
  background-color: $dark-grey;
}

.shape-palette {
  position: absolute;
  z-index: 900;
  left: 0;
  bottom: calc(100% - 0.25rem);
  background-color: $dark-grey-light;
  border-radius: 5px;
}
.preview .shape-palette {
  background-color: $dark-grey;
}
.shape-palette label {
  display: block;
  margin: 0.5rem 0;
  cursor: pointer;
}
.shape-palette input {
  display: none;
}

.shape-button {
  background: transparent;
  color: white;
  padding-left: 2px;
  padding-right: 2px;
  cursor: pointer;
}

.shape-button:hover {
  color: #aaaaaa;
}
</style>
