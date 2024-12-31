<template>
  <div class="field">
    <label class="label">{{ label }}</label>
    <div class="control colors">
      <div
        class="color"
        :class="{
          selected: modelValue === color
        }"
        :key="`color-${index}`"
        :style="{ 'border-color': color + hexaOpacity }"
        @click="colorChanged(color)"
        v-for="(color, index) in colors"
      >
        <span :style="{ background: color + hexaOpacity }"> </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'color-field',

  props: {
    colors: {
      default: () => [
        '#CCCCCC',
        '#999999',
        '#78909C',
        '#009688',
        '#33B378',
        '#7CB342',
        '#43A047',
        '#8D6E63',
        '#AFB42B',
        '#9CCC65',
        '#DCE775',
        '#FFF176',
        '#FFEB3B',
        '#F9A825',
        '#F57C00',
        '#ff5252',
        '#F06292',
        '#AB47BC',
        '#5C6BC0',
        '#1976D2',
        '#039BE5',
        '#42A5F5',
        '#64B5F6',
        '#26C6DA'
      ]
    },
    column: {
      default: 8,
      type: Number
    },
    hexaOpacity: {
      default: 'FF',
      type: String
    },
    label: {
      default: '',
      type: String
    },
    modelValue: {
      default: '#999999',
      type: String
    }
  },

  emits: ['update:modelValue'],

  methods: {
    colorChanged(color, index) {
      this.$emit('update:modelValue', color)
    }
  }
}
</script>

<style lang="scss" scoped>
.colors {
  display: grid;
  grid-template-columns: repeat(v-bind(column), minmax(auto, 80px));
  row-gap: 15px;
}

.color {
  display: inline-block;
  cursor: pointer;
  padding: 3px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: 0.3s ease-out all;

  &:hover {
    transform: scale(1.2);
  }

  &.selected {
    border: 5px solid $light-green;
    padding: 4px;
  }

  span {
    display: inline-block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}
</style>
