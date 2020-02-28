<template>
<div class="color-wrapper">
  <button
    type="button"
    :class="{
      'color-picker': true
    }"
    :title="color"
    :style="{ color: color }"
    @click="togglePalette"
  />
  <div
    v-show="isOpen"
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
        :value="shade"
        @click="onColorPicked(shade)"
      />
    </label>
  </div>
</div>
</template>

<script>
export default {
  name: 'colorpicker',

  props: {
    color: {
      type: String
    },
    palette: {
      type: Array
    }
  },

  data () {
    return {
      isOpen: false
    }
  },

  computed: {
  },

  methods: {
    togglePalette () {
      this.isOpen = !this.isOpen
    },

    onColorPicked (shade) {
      this.$emit('change', shade)
      this.isOpen = false
    }
  }
}
</script>

<style lang="scss" scoped>
.color-wrapper {
  position: relative;
  display: inline-flex;
}
.color-picker {
  padding: 0;
  background-color: transparent;
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
  z-index: 900;
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
</style>
