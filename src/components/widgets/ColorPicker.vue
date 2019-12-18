<template>
<div class="color-wrapper">
  <transition name="slide">
    <button
      type="button"
      v-show="isActive"
      :class="{
        'color-picker': true
      }"
      :title="color"
      :style="{ color: color }"
      @click="$emit('TogglePalette')"
    />
  </transition>
  <div
    v-show="isActive && isOpen"
    :class="{
      'color-palette': true,
    }"
  >
    <label
      v-for="shade in palette"
      :key="shade"
      :title="shade"
      :style="{ color: shade }"
    >
      <input
        type="radio"
        :value="newColor = shade"
        v-model="radioButtonValue"
      />
    </label>
  </div>
</div>
</template>

<script>
export default {
  name: 'colorpicker',

  model: {
    prop: 'checked',
    event: 'change'
  },

  props: {
    isActive: {
      type: Boolean,
      default: false
    },
    isOpen: {
      type: Boolean,
      default: false
    },
    color: {
      type: String
    },
    palette: {
      type: Array
    }
  },

  data () {
    return {
      newColor: this.color
    }
  },

  computed: {
    radioButtonValue: {
      get: function () {
        return this.value
      },
      set: function () {
        this.$emit('change', this.newColor)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.color-wrapper {
  position: relative;
}
.color-picker {
  padding: 0;
  background-color: transparent;
  height: 2.3rem;
  cursor: pointer;
}
.preview .color-picker {
  background-color: $dark-grey;
}
.color-picker::before,
.color-palette label::before {
  display: block;
  content: '';
  margin: .25rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: currentColor;
}
.color-palette {
  position: absolute;
  z-index: 300;
  left: 0;
  bottom: calc(100% - .25rem);
  background-color: $dark-grey-light;
  border-radius: 5px;
}
.preview .color-palette {
  background-color: $dark-grey;
}
.color-palette label {
  display: block;
  margin: .5rem 0;
  cursor: pointer;
}
.color-palette input {
  display: none;
}
.slide-enter-active {
  transition: all .3s ease;
}
.slide-leave-active {
  transition: all .3s ease;
}
.slide-enter, .slide-leave-to {
  transform: translateX(1.5rem);
}
</style>
