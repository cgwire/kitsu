<template>
<div class="field">
  <label class="label">{{ label }}</label>
  <p class="control">
    <div
      :class="{
        color: true,
        selected: selectedIndex == index
      }"
      :ref="'color-' + index"
      v-for="(color, index) in colors"
      @click="colorChanged(color, index)"
    >
      <span
        :style="{ background: color }"
      >
      </span>
    </div>
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { Compact } from 'vue-color'

export default {
  name: 'text-field',
  props: {
    label: {
      default: '',
      type: String
    },
    value: {
      default: '',
      type: String
    },
    placeholder: {
      default: '',
      type: String
    },
    type: {
      default: 'text',
      type: String
    }
  },
  data () {
    return {
      colors: [
        '#999999',
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
      ],
      selectedIndex: -1
    }
  },
  components: {
    'color-picker': Compact
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    colorChanged (color, index) {
      this.selectedIndex = index
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
  border: 3px solid #67BE4B;
}
</style>
