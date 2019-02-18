<template>
<div class="field">
  <label class="label">{{ label }}</label>
  <div class="control colors">
    <div
      :class="{
        color: true,
        selected: value === color
      }"
      :ref="'color-' + index"
      :key="'color-' + index"
      v-for="(color, index) in colors"
      @click="colorChanged(color)"
    >
      <span
        :style="{ background: color }"
      >
      </span>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'text-field',
  props: {
    label: {
      default: '',
      type: String
    },
    value: {
      default: '$grey999',
      type: String
    },
    placeholder: {
      default: '',
      type: String
    },
    type: {
      default: 'text',
      type: String
    },
    colors: {
      default: () => [
        '$grey999',
        '#8D6E63',
        '#43A047',
        '#7CB342',
        '#009688',
        '#9CCC65',
        '#AFB42B',
        '#F9A825',
        '#F57C00',
        '#ff5252',
        '#F06292',
        '#AB47BC',
        '#5C6BC0',
        '#039BE5',
        '#26C6DA',
        '#64B5F6',
        '#78909C'
      ]
    }
  },
  data () {
    return {
      selectedColor: '$grey999'
    }
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    colorChanged (color, index) {
      this.$emit('input', color)
    }
  }
}
</script>
<style>
.color {
  display: inline-block;
  cursor: pointer;
  border: 3px solid transparent;
  padding: 3px;
  width: 52px;
  height: 52px;
}

.color span {
  display: inline-block;
  width: 40px;
  height: 40px;
}

.selected {
  border: 3px solid $light-green;
}
</style>
